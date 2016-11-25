package com.example.chris.lab5;

import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.KeyEvent;
import android.widget.EditText;
import android.view.View;
import android.content.Intent;

public class EnterNameActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.enter_name);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        final Intent goToGame = new Intent(getApplicationContext(), Lab5Main.class);

//        Intent i = new Intent(this, MyNewActivity.class);
//        i.putExtra("text_label", theText);
//        startActivity(i)


        final EditText input = (EditText) findViewById(R.id.editText);
        input.setOnKeyListener(new View.OnKeyListener() {
            @Override
            public boolean onKey(View view, int i, KeyEvent keyEvent) {
                if (!(keyEvent.getAction() == KeyEvent.ACTION_DOWN)) {
                    return false;
                }
                if (i != KeyEvent.KEYCODE_ENTER) {
                    return false;
                }
                goToGame.putExtra("playerName", input.getText().toString());
                startActivity(goToGame);
                return true;
            }
        });

    }

}
