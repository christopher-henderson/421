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

public class Lab5Main extends AppCompatActivity {


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
        browser.addJavascriptInterface(new Locator(i.getStringExtra("playerName")), "locator");
        browser.addJavascriptInterface(new Restarter(), "restarter");
        browser.loadUrl(getString(R.string.wvURL));
    }


    public class Locator {

        private String playerName;

        public Locator(String playerName) {
            this.playerName = playerName;
        }

        @JavascriptInterface
        public String getLocation() {
            return this.playerName;
        }
    }

    public class Restarter {

        @JavascriptInterface
        public void restart() {
            final Intent restart = new Intent(getApplicationContext(), EnterNameActivity.class);
            restart.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(restart);
        }
    }

    @Override
    public void onBackPressed() {
        new AlertDialog.Builder(this)
            .setTitle("Reset the game?")
            .setMessage("This action will reset the game. Are you sure you wish to continue?")
            .setIcon(android.R.drawable.ic_dialog_alert)
            .setPositiveButton(android.R.string.yes, new DialogInterface.OnClickListener() {
                public void onClick(DialogInterface dialog, int whichButton) {
                    final Intent restart = new Intent(getApplicationContext(), EnterNameActivity.class);
                    restart.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    startActivity(restart);
                }})
            .setNegativeButton(android.R.string.no, null).show();
    }
}
