package com.unboxing;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.rnfs.RNFSPackage;
import com.balthazargronon.RCTZeroconf.ZeroconfReactPackage;
import com.sensors.RNSensorsPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.zmxv.RNSound.RNSoundPackage;
import com.tradle.react.UdpSocketsModule;
import com.zmxv.RNSound.RNSoundPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
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
            new RNFSPackage(),
            new ZeroconfReactPackage(),
            new RNSensorsPackage(),
            new KCKeepAwakePackage(),
            new UdpSocketsModule(),
            new RNSoundPackage()
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
