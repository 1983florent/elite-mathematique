#!/usr/bin/env python3
"""Audite des fichiers CSS/HTML au regard du système de grille Müller-Brockmann.

Le script ne juge pas l'esthétique : il repère mécaniquement les valeurs qui sortent
du système, c'est-à-dire les décisions prises hors grille. Chaque signalement est soit
à corriger, soit à justifier consciemment.

Contrôles effectués :
  1. Espacements verticaux (margin/padding/gap/top/bottom/height) non multiples de l'unité.
  2. Hauteurs de ligne qui ne retombent pas sur la trame.
  3. Ornements proscrits par le système (ombres portées, dégradés, coins très arrondis).
  4. Alignements de texte centrés ou justifiés sur du contenu long.
  5. Couleurs en dur, qui court-circuitent les jetons du thème.

Usage :
    python verify_grid.py site.css index.html
    python verify_grid.py --baseline 8 --strict styles/
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

SPACING_PROPS = (
    "margin", "margin-top", "margin-bottom", "margin-block", "margin-block-start",
    "margin-block-end", "padding", "padding-top", "padding-bottom", "padding-block",
    "padding-block-start", "padding-block-end", "gap", "row-gap", "column-gap",
    "top", "bottom", "height", "min-height", "max-height", "translate",
)

DECL_RE = re.compile(r"(?P<prop>[-a-zA-Z]+)\s*:\s*(?P<value>[^;{}]+)", re.MULTILINE)
PX_RE = re.compile(r"(-?\d*\.?\d+)px")
HEX_COLOR_RE = re.compile(r"#[0-9a-fA-F]{3,8}\b")
FUNC_COLOR_RE = re.compile(r"\b(?:rgba?|hsla?)\s*\(")
COMMENT_RE = re.compile(r"/\*.*?\*/", re.DOTALL)

# Ornements : motif -> raison
ORNAMENTS = {
    r"box-shadow\s*:\s*(?!none)": "ombre portée — détache l'élément du plan de la page",
    r"text-shadow\s*:\s*(?!none)": "ombre de texte — nuit à la lisibilité sans informer",
    r"(?:linear|radial|conic)-gradient\s*\(": "dégradé décoratif — sans fonction informative",
}

TEXT_ALIGN_RE = re.compile(r"text-align\s*:\s*(center|justify)")
RADIUS_RE = re.compile(r"border-radius\s*:\s*([^;}]+)")

# Propriétés dont les valeurs px hors grille sont légitimes.
EXEMPT_PROPS = {"border-radius", "border", "border-width", "outline", "outline-width",
                "letter-spacing", "text-underline-offset", "stroke-width", "filter"}


class Finding:
    __slots__ = ("path", "line", "severity", "message", "snippet")

    def __init__(self, path: str, line: int, severity: str, message: str, snippet: str):
        self.path = path
        self.line = line
        self.severity = severity
        self.message = message
        self.snippet = snippet.strip()[:80]


def line_of(text: str, index: int) -> int:
    return text.count("\n", 0, index) + 1


def strip_comments(text: str) -> str:
    """Neutralise les commentaires en préservant les positions (donc les numéros de ligne)."""
    def blank(match: re.Match) -> str:
        return re.sub(r"[^\n]", " ", match.group(0))
    return COMMENT_RE.sub(blank, text)


def extract_css(text: str, is_html: bool) -> str:
    """Pour un HTML, ne garde que les blocs <style> et les attributs style=."""
    if not is_html:
        return text

    def blank(match: re.Match) -> str:
        return re.sub(r"[^\n]", " ", match.group(0))

    kept = re.sub(r"[^\n]", " ", text)
    kept = list(kept)
    for match in re.finditer(r"<style[^>]*>(.*?)</style>", text, re.DOTALL | re.IGNORECASE):
        start, end = match.span(1)
        kept[start:end] = list(text[start:end])
    for match in re.finditer(r"""\bstyle\s*=\s*["']([^"']*)["']""", text, re.IGNORECASE):
        start, end = match.span(1)
        kept[start:end] = list(text[start:end])
    return "".join(kept)


def check_spacing(css: str, path: str, baseline: int, findings: list[Finding]) -> None:
    for match in DECL_RE.finditer(css):
        prop = match.group("prop").lower()
        value = match.group("value")
        if prop in EXEMPT_PROPS or prop not in SPACING_PROPS:
            continue
        if "var(" in value or "calc(" in value:
            continue
        for raw in PX_RE.findall(value):
            px = float(raw)
            if px and px % baseline != 0:
                nearest = round(px / baseline) * baseline
                findings.append(Finding(
                    path, line_of(css, match.start()), "grid",
                    f"{prop}: {raw}px n'est pas un multiple de {baseline} "
                    f"(valeur sur grille la plus proche : {nearest:g}px, ou var(--mb-space-*))",
                    match.group(0),
                ))


def check_line_height(css: str, path: str, baseline: int, findings: list[Finding]) -> None:
    for match in re.finditer(r"line-height\s*:\s*([^;}]+)", css):
        value = match.group(1).strip()
        if "var(" in value:
            continue
        px = PX_RE.findall(value)
        if px:
            for raw in px:
                if float(raw) % baseline != 0:
                    findings.append(Finding(
                        path, line_of(css, match.start()), "rhythm",
                        f"line-height: {raw}px — le texte ne retombera pas sur la trame "
                        f"(multiples de {baseline} attendus)",
                        match.group(0),
                    ))
        elif re.fullmatch(r"-?\d*\.?\d+", value):
            findings.append(Finding(
                path, line_of(css, match.start()), "rhythm",
                f"line-height: {value} sans unité — la hauteur de ligne dépend alors de la "
                "taille de police et sort de la trame ; préférer une valeur en px ou rem "
                "multiple de la ligne de base",
                match.group(0),
            ))


def check_ornaments(css: str, path: str, findings: list[Finding]) -> None:
    for pattern, reason in ORNAMENTS.items():
        for match in re.finditer(pattern, css):
            findings.append(Finding(
                path, line_of(css, match.start()), "ornament",
                f"{reason}", match.group(0),
            ))
    for match in RADIUS_RE.finditer(css):
        value = match.group(1)
        for raw in PX_RE.findall(value):
            if float(raw) > 4:
                findings.append(Finding(
                    path, line_of(css, match.start()), "ornament",
                    f"border-radius: {raw}px — l'arrondi marqué éloigne l'élément du champ "
                    "de la grille (0 ou 2px dans ce système)",
                    match.group(0),
                ))
    for match in TEXT_ALIGN_RE.finditer(css):
        findings.append(Finding(
            path, line_of(css, match.start()), "alignment",
            f"text-align: {match.group(1)} — le ferré à gauche est l'alignement du système ; "
            "à ne conserver que pour un élément isolé et volontaire",
            match.group(0),
        ))


def check_colors(css: str, path: str, findings: list[Finding]) -> None:
    for match in HEX_COLOR_RE.finditer(css):
        findings.append(Finding(
            path, line_of(css, match.start()), "color",
            f"couleur en dur {match.group(0)} — passer par var(--mb-*) pour rester cohérent "
            "entre thèmes clair et sombre",
            match.group(0),
        ))
    for match in FUNC_COLOR_RE.finditer(css):
        findings.append(Finding(
            path, line_of(css, match.start()), "color",
            "couleur en dur — passer par var(--mb-*) pour rester cohérent entre thèmes",
            match.group(0),
        ))


def collect_files(targets: list[str]) -> list[Path]:
    files: list[Path] = []
    for target in targets:
        path = Path(target)
        if path.is_dir():
            for suffix in ("*.css", "*.html", "*.htm"):
                files.extend(sorted(path.rglob(suffix)))
        elif path.exists():
            files.append(path)
        else:
            print(f"introuvable : {target}", file=sys.stderr)
    return files


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("targets", nargs="+", help="fichiers ou dossiers CSS/HTML à auditer")
    parser.add_argument("--baseline", type=int, default=8, help="unité de base en px (défaut : 8)")
    parser.add_argument("--strict", action="store_true",
                        help="inclure aussi les couleurs en dur, souvent nombreuses")
    parser.add_argument("--skip-tokens", action="store_true", default=True,
                        help="ignorer les fichiers de définition du système (grid.css)")
    args = parser.parse_args()

    findings: list[Finding] = []
    files = collect_files(args.targets)

    for path in files:
        if args.skip_tokens and path.name == "grid.css":
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError) as exc:
            print(f"illisible : {path} ({exc})", file=sys.stderr)
            continue

        css = strip_comments(extract_css(text, path.suffix.lower() in (".html", ".htm")))
        name = str(path)
        check_spacing(css, name, args.baseline, findings)
        check_line_height(css, name, args.baseline, findings)
        check_ornaments(css, name, findings)
        if args.strict:
            check_colors(css, name, findings)

    if not files:
        print("Aucun fichier à auditer.")
        return 0

    findings.sort(key=lambda f: (f.path, f.line))
    for finding in findings:
        print(f"{finding.path}:{finding.line}: [{finding.severity}] {finding.message}")
        print(f"    {finding.snippet}")

    counts: dict[str, int] = {}
    for finding in findings:
        counts[finding.severity] = counts.get(finding.severity, 0) + 1

    print()
    print(f"{len(files)} fichier(s) audité(s) — {len(findings)} signalement(s)")
    for severity in sorted(counts):
        print(f"  {severity}: {counts[severity]}")
    if not findings:
        print("Le système est respecté sur les points vérifiables mécaniquement.")

    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())
