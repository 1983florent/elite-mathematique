package sn.elitemathematique.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.view.View;
import android.view.WindowInsets;
import android.widget.FrameLayout;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

/**
 * ELITE MATHÉMATIQUE pour Android.
 * Le logiciel web complet est embarqué dans les assets (dossier www) : tout fonctionne sans connexion.
 * La progression de l'élève est conservée par le WebView (stockage local).
 */
public class MainActivity extends Activity {

    private static final String ACCUEIL = "file:///android_asset/www/index.html";
    private static final int CHOIX_FICHIER = 42;

    private WebView web;
    private ValueCallback<Uri[]> rappelFichier;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle etat) {
        super.onCreate(etat);
        web = new WebView(this);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        // Le WebView est posé dans un cadre couleur encre : sur Android 15 et plus, l'application occupe
        // tout l'écran (« bord à bord ») et le cadre se décale des barres système et du clavier.
        FrameLayout cadre = new FrameLayout(this);
        cadre.setBackgroundColor(Color.parseColor("#121A52"));
        cadre.addView(web, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(cadre);
        if (Build.VERSION.SDK_INT >= 35) {
            cadre.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() {
                @Override
                public WindowInsets onApplyWindowInsets(View vue, WindowInsets marges) {
                    Insets barres = marges.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                    Insets clavier = marges.getInsets(WindowInsets.Type.ime());
                    vue.setPadding(barres.left, barres.top, barres.right, Math.max(barres.bottom, clavier.bottom));
                    return WindowInsets.CONSUMED;
                }
            });
        }
        // Android 13 et plus : le geste ou le bouton « retour » revient à la page précédente du logiciel
        // (onBackPressed n'est plus appelé pour les applications qui ciblent Android 16).
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT,
                    new OnBackInvokedCallback() {
                        @Override
                        public void onBackInvoked() {
                            retour();
                        }
                    });
        }

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(false);
        s.setTextZoom(100);
        s.setSupportZoom(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);

        web.addJavascriptInterface(new Pont(), "AndroidBridge");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView vue, WebResourceRequest requete) {
                return ouvrirAilleurs(requete.getUrl().toString());
            }

            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView vue, String url) {
                return ouvrirAilleurs(url);
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView vue, ValueCallback<Uri[]> rappel, FileChooserParams params) {
                if (rappelFichier != null) rappelFichier.onReceiveValue(null);
                rappelFichier = rappel;
                try {
                    startActivityForResult(params.createIntent(), CHOIX_FICHIER);
                } catch (ActivityNotFoundException e) {
                    rappelFichier = null;
                    Toast.makeText(MainActivity.this, "Aucune application pour choisir un fichier", Toast.LENGTH_SHORT).show();
                    return false;
                }
                return true;
            }
        });

        if (etat != null) web.restoreState(etat);
        else web.loadUrl(ACCUEIL);
    }

    /** Les pages du logiciel restent dans l'application ; les autres liens (WhatsApp, e-mail…) s'ouvrent à part. */
    private boolean ouvrirAilleurs(String url) {
        if (url.startsWith("file:///android_asset/")) return false;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "Impossible d'ouvrir ce lien", Toast.LENGTH_SHORT).show();
        }
        return true;
    }

    @Override
    protected void onActivityResult(int code, int resultat, Intent donnees) {
        if (code == CHOIX_FICHIER && rappelFichier != null) {
            rappelFichier.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultat, donnees));
            rappelFichier = null;
            return;
        }
        super.onActivityResult(code, resultat, donnees);
    }

    @Override
    protected void onSaveInstanceState(Bundle etat) {
        super.onSaveInstanceState(etat);
        web.saveState(etat);
    }

    /** Retour : page précédente du logiciel, sinon l'application passe en arrière-plan (comme l'accueil d'Android). */
    private void retour() {
        if (web.canGoBack()) web.goBack();
        else moveTaskToBack(true);
    }

    /** Android 12 et moins. */
    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        retour();
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }

    /** Fonctions appelées depuis le JavaScript (window.AndroidBridge). */
    private class Pont {
        /** Partage un texte (résultat, progression exportée…) via WhatsApp, Bluetooth, e-mail… */
        @JavascriptInterface
        public void partager(final String texte, final String titre) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Intent i = new Intent(Intent.ACTION_SEND);
                    i.setType("text/plain");
                    i.putExtra(Intent.EXTRA_TEXT, texte);
                    i.putExtra(Intent.EXTRA_SUBJECT, titre);
                    startActivity(Intent.createChooser(i, titre));
                }
            });
        }

        /** Imprime la page affichée (fiches d'exercices) ou l'enregistre en PDF. */
        @JavascriptInterface
        public void imprimer(final String titre) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    PrintManager pm = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                    if (pm == null) return;
                    String nom = (titre == null || titre.isEmpty()) ? "Fiche ELITE MATHEMATIQUE" : titre;
                    pm.print(nom, web.createPrintDocumentAdapter(nom), new PrintAttributes.Builder()
                            .setMediaSize(PrintAttributes.MediaSize.ISO_A4).build());
                }
            });
        }

        @JavascriptInterface
        public boolean estAndroid() {
            return true;
        }
    }
}
