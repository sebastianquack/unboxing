package com.unboxing;

import android.app.ActivityManager;
import android.app.AlarmManager;
import android.app.KeyguardManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.os.PowerManager;
import android.support.annotation.Nullable;
import android.util.Log;

import java.util.List;

/**
 * Created by kobkrit on 5/15/2017 AD.
 */

public class RestartService extends Service {

    private static final String TAG = "RestartService";
    private static PowerManager.WakeLock fullWakeLock;
    private static KeyguardManager.KeyguardLock keyguardLock;

    public boolean isMainActivityRunning(String packageName) {
        ActivityManager activityManager = (ActivityManager) getSystemService (Context.ACTIVITY_SERVICE);
        List<ActivityManager.RunningTaskInfo> tasksInfo = activityManager.getRunningTasks(Integer.MAX_VALUE);

        for (int i = 0; i < tasksInfo.size(); i++) {
            if (tasksInfo.get(i).baseActivity.getPackageName().equals(packageName))
                return true;
        }

        return false;
    }

    public static void restart(Context c) {
        try {
            //check if the context is given
            if (c != null) {
                //fetch the packagemanager so we can get the default launch activity
                // (you can replace this intent with any other activity if you want
                PackageManager pm = c.getPackageManager();
                //check if we got the PackageManager
                if (pm != null) {
                    //create the intent with the default start activity for your application
                    Intent mStartActivity = pm.getLaunchIntentForPackage(
                            c.getPackageName()
                    );
                    if (mStartActivity != null) {
                        mStartActivity.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
                        //create a pending intent so the application is restarted after System.exit(0) was called.
                        // We use an AlarmManager to call this intent in 100ms
                        int mPendingIntentId = 223344;
                        PendingIntent mPendingIntent = PendingIntent
                                .getActivity(c, mPendingIntentId, mStartActivity,
                                        PendingIntent.FLAG_CANCEL_CURRENT);
                        AlarmManager mgr = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
                        mgr.set(AlarmManager.RTC, System.currentTimeMillis() + 100, mPendingIntent);
                        //kill the application
                        // System.exit(0);
                    } else {
                        Log.e(TAG, "Was not able to restart application, mStartActivity null");
                    }
                } else {
                    Log.e(TAG, "Was not able to restart application, PM null");
                }
            } else {
                Log.e(TAG, "Was not able to restart application, Context null");
            }
        } catch (Exception ex) {
            Log.e(TAG, "Was not able to restart application");
        }
    }


    public boolean isWakeUp(){
        PowerManager pm = (PowerManager) this.getSystemService(Context.POWER_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT_WATCH) {
            return pm.isInteractive();
        } else {
            return pm.isScreenOn();
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        super.onStartCommand(intent, flags, startId);
        Log.d(TAG, "onStartCommand");

        boolean fromTimer = false;
        if (intent !=null) {
            Bundle b = intent.getExtras();
            if (b != null) {
                fromTimer = b.getBoolean("timer", false);
            }
        }
        boolean isWake = isWakeUp();
        Log.d(TAG,"onStartCommand");
        Log.d(TAG,"packageName: "+this.getPackageName());
        Log.d(TAG,"fromTimer: "+fromTimer);
        Log.d(TAG,"isWake: "+isWake);

        ActivityManager activityManager = (ActivityManager) this.getSystemService(Context.ACTIVITY_SERVICE);
        List<ActivityManager.RunningTaskInfo> services = activityManager
                .getRunningTasks(Integer.MAX_VALUE);
        boolean isActivityFound = false;

        if (services.get(0).topActivity.getPackageName()
                .equalsIgnoreCase(this.getPackageName())) {
            isActivityFound = true;
        }
        Log.d(TAG,"isActivityFound: "+isActivityFound);


        if (isActivityFound && !fromTimer) {
            Log.d(TAG, "Still running...");
        } else {
            Log.d(TAG, "Not running restart...");
            restart(this);
        }

        return START_STICKY;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}