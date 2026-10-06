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

    const val DEFAULT_MODEL = "openai/gpt-5.6-sol"
}