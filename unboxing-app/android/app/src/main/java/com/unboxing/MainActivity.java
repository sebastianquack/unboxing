package com.unboxing;

import com.facebook.react.ReactActivity;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.PersistableBundle;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Window;
import android.view.WindowManager;
import android.view.View;

import java.util.Calendar;


public class MainActivity extends ReactActivity {

    private PendingIntent pintent;
    private AlarmManager alarm;
    private final int NUM_SECOND = 60 * 60; //One Hour
    private Intent sticky;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "unboxing";
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {

        Log.d("KB", Integer.toString(KeyEvent.KEYCODE_APP_SWITCH));

        if (keyCode == KeyEvent.KEYCODE_HOME) {
            return false;
        }

        if (keyCode == KeyEvent.KEYCODE_BACK ) {
            return true;
        }

        if (keyCode == KeyEvent.KEYCODE_APP_SWITCH){
            return false;
        }

        return super.onKeyDown(keyCode, event);
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        final Thread.UncaughtExceptionHandler oldHandler = Thread.getDefaultUncaughtExceptionHandler();

        Thread.setDefaultUncaughtExceptionHandler(
                new Thread.UncaughtExceptionHandler() {
                    @Override
                    public void uncaughtException(Thread paramThread, Throwable paramThrowable) {
                        //Do your own error handling here
                        restartApp();
                        if (oldHandler != null)
                            oldHandler.uncaughtException(paramThread, paramThrowable); //Delegates to Android's error handling
                        else
                            System.exit(2); //Prevents the service/app from freezing
                    }
                });
    }

    public void restartApp() {
        Intent i = getBaseContext().getPackageManager().getLaunchIntentForPackage(getBaseContext().getPackageName());
        i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(i);
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState, @Nullable PersistableBundle persistentState) {
        super.onCreate(savedInstanceState, persistentState);

        //Disable NAVIGATION_BAR
        this.requestWindowFeature(Window.FEATURE_NO_TITLE);
        this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);
        this.getWindow().getDecorView()
                .setSystemUiVisibility(View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_IMMERSIVE);
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.d("kobkrit", "MainActivity onResume");

        //Allow to restart when the app is crash.
        Intent myIntent = new Intent(this, RestartService.class);
        startService(myIntent);

        //Reschedule to restart every NUM_SECOND second.
//        sticky = new Intent(this, RestartService.class);
//        sticky.putExtra("timer", true);
//        pintent = PendingIntent.getService(this, 0, sticky, PendingIntent.FLAG_UPDATE_CURRENT);
//        alarm = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
//        alarm.cancel(pintent);
//
//        Calendar calendar = Calendar.getInstance();
//        calendar.setTimeInMillis(System.currentTimeMillis());
//        calendar.add(Calendar.SECOND, NUM_SECOND); // first time
//
//        //Schedule the service to restart every NUM_SECOND second.
//        alarm.setRepeating(AlarmManager.RTC_WAKEUP, calendar.getTimeInMillis(), NUM_SECOND * 1000, pintent);
    }

}