package com.example.chris.lab5;


import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.webkit.JavascriptInterface;
import android.content.Intent;
import org.json.JSONException;
import android.widget.Toast;

import android.content.DialogInterface;
import android.app.AlertDialog;
import android.util.Log;

public class Lab6Main extends AppCompatActivity {

    public Locator locator;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_lab5_main);
        WebView browser = (WebView) findViewById(R.id.webview);

        browser.setHorizontalScrollBarEnabled(true);
        browser.setVerticalScrollBarEnabled(true);
        browser.setWebContentsDebuggingEnabled(true);
        WebSettings ws = browser.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        Intent i = getIntent();
        this.locator = new Locator(i.getStringExtra("playerName"));
        browser.addJavascriptInterface(this.locator, "locator");
        browser.addJavascriptInterface(new Restarter(this.locator), "restarter");
        browser.loadUrl(getString(R.string.wvURL));
    }

    public class Locator {

        private String playerName;
        public String record;

        public Locator(String playerName) {
            this.playerName = playerName;
        }

        @JavascriptInterface
        public String getLocation(String record) {
            // I truly despise this. This annotation just would not work sometimes.
            // No error message, no warning, just the method would be undefined in the JS.
            // There was no explanation. It could be a copy-and-paste of this exact working code
            // but with a different name and it would not work. So THIS method works. It shows up
            // in the JS like it's suppose, so I'm going to shove all I can into it.
            if (record != null) {
                this.record = record;
            }
            return this.playerName;
        }
    }

    public class Restarter {

        Locator locator;

        Restarter(Locator locator) {
            this.locator = locator;
        }

        @JavascriptInterface
        public void restart() {
            final String r = this.locator.record;
            final Intent restart = new Intent(getApplicationContext(), EnterNameActivity.class);
            restart.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            restart.putExtra("record", this.locator.record);
            restart.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(restart);
        }
    }

    @Override
    public void onBackPressed() {
        final String r = this.locator.record;
        new AlertDialog.Builder(this)
            .setTitle("Reset the game?")
            .setMessage("This action will reset the game. Are you sure you wish to continue?")
            .setIcon(android.R.drawable.ic_dialog_alert)
            .setPositiveButton(android.R.string.yes, new DialogInterface.OnClickListener() {
                public void onClick(DialogInterface dialog, int whichButton) {
                    final Intent restart = new Intent(getApplicationContext(), EnterNameActivity.class);
                    startActivity(restart);
                }})
            .setNegativeButton(android.R.string.no, null).show();
    }
}
