package com.unboxing;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.rnrestartandroid.RNRestartAndroidPackage;
import dk.madslee.imageSequence.RCTImageSequencePackage;
import com.devstepbcn.wifi.AndroidWifiPackage;
import me.hauvo.thumbnail.RNThumbnailPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import codes.simen.IMEI.IMEI;
import com.horcrux.svg.SvgPackage;
import com.zmxv.RNSound.RNSoundPackage;
import com.sensors.RNSensorsPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.rnfs.RNFSPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNRestartAndroidPackage(),
            new RCTImageSequencePackage(),
            new AndroidWifiPackage(),
            new RNThumbnailPackage(),
            new ReactVideoPackage(),
            new LinearGradientPackage(),
            new IMEI(),
            new SvgPackage(),
            new RNSoundPackage(),
            new RNSensorsPackage(),
            new KCKeepAwakePackage(),
            new RNFSPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
