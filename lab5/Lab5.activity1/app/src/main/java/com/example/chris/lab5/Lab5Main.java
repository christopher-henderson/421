package com.example.chris.lab5;

import android.location.Location;
import android.net.Uri;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.widget.EditText;
import android.webkit.JavascriptInterface;
import android.content.Intent;

import org.json.JSONException;
import org.json.JSONObject;

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
        browser.loadUrl(getString(R.string.wvURL));
    }

    public class NameService {
        @JavascriptInterface
        public String getName() throws JSONException {
            return "Chris";
//            final EditText input = (EditText) findViewById(R.id.editText);
//            return input.getText().toString();
        }
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
}
