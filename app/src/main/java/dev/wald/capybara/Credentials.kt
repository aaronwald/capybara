package dev.wald.capybara

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

// A6 / R3: the key lives only in Android Keystore-backed storage; never in repo or config files.
object Credentials {

    private lateinit var prefs: SharedPreferences

    fun init(context: Context) {
        val master = MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build()
        prefs = EncryptedSharedPreferences.create(
            context,
            "credentials",
            master,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
        )
    }

    var openRouterKey: String
        get() = prefs.getString("openrouter_key", "") ?: ""
        set(value) = prefs.edit().putString("openrouter_key", value).apply()

    var openRouterModel: String
        get() = prefs.getString("openrouter_model", DEFAULT_MODEL) ?: DEFAULT_MODEL
        set(value) = prefs.edit().putString("openrouter_model", value).apply()

    // 10.0.2.2 is the emulator's alias for the host machine running `hermes proxy start`
    var hermesProxyUrl: String
        get() = prefs.getString("hermes_proxy_url", DEFAULT_HERMES_URL) ?: DEFAULT_HERMES_URL
        set(value) = prefs.edit().putString("hermes_proxy_url", value).apply()

    var hermesModel: String
        get() = prefs.getString("hermes_model", "") ?: ""
        set(value) = prefs.edit().putString("hermes_model", value).apply()

    const val DEFAULT_MODEL = "openai/gpt-5.6-sol"
    const val DEFAULT_HERMES_URL = "http://10.0.2.2:8645/v1"
}