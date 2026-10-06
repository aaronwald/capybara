package dev.wald.capybara

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.add
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

interface Dispatcher {
    val name: String
    suspend fun dispatch(payload: String): Result<String>
}

class OpenRouterDispatcher : Dispatcher {
    override val name = "openroute"
    private val client = OkHttpClient()

    override suspend fun dispatch(payload: String): Result<String> = withContext(Dispatchers.IO) {
        runCatching {
            val key = Credentials.openRouterKey
            require(key.isNotEmpty()) { "Set the OpenRouter API key in Settings." }
            val body = buildJsonObject {
                put("model", Credentials.openRouterModel)
                put("messages", buildJsonArray {
                    add(buildJsonObject {
                        put("role", "user")
                        put("content", payload)
                    })
                })
            }
            val request = Request.Builder()
                .url("https://openrouter.ai/api/v1/chat/completions")
                .header("Authorization", "Bearer $key")
                .post(body.toString().toRequestBody("application/json".toMediaType()))
                .build()
            client.newCall(request).execute().use { response ->
                val text = response.body.string()
                require(response.isSuccessful) { "HTTP ${response.code}: $text" }
                Json.parseToJsonElement(text).jsonObject["choices"]!!
                    .jsonArray[0].jsonObject["message"]!!.jsonObject["content"]!!
                    .jsonPrimitive.content
            }
        }
    }
}

// A5: hermes and muse stay selectable targets; their endpoints are not wired yet.
class UnconfiguredDispatcher(override val name: String) : Dispatcher {
    override suspend fun dispatch(payload: String): Result<String> = Result.failure(
        IllegalStateException("$name: dispatch endpoint is not configured yet. MVP ships openroute only.")
    )
}

object Targets {
    val all: List<Dispatcher> = listOf(
        OpenRouterDispatcher(),
        UnconfiguredDispatcher("hermes"),
        UnconfiguredDispatcher("muse"),
    )

    fun byName(name: String): Dispatcher = all.find { it.name == name } ?: all.first()
}

// A4.1/A4.2: the wrapper prompt envelope with the return schema (A4.5-A4.8)
fun wrapperPrompt(task: Task, promptText: String): String = """
    You are an agent. You execute a task. The app reads your reply as data.
    Return only valid JSON. Obey this schema exactly:
    {"version":1,"status":"done"|"failed","result_text":"...","follow_ups":[{"title":"...","due_date":"YYYY-MM-DD","prompt":"..."}]}
    Rules:
    - "status" is "done" if you did the task. Else it is "failed".
    - "result_text" tells the user what you did.
    - "follow_ups" lists follow-up tasks. Omit the field if there are none.
    - "due_date" and "prompt" inside a follow-up are optional.
    - Do not write any text outside the JSON.

    Task: ${task.title}
    ${task.description}
    Prompt: $promptText
""".trimIndent()

// A7.2: a reply that does not obey the schema counts as a failure
fun parseReturnData(raw: String): ReturnData {
    val text = raw.substringAfter("```json", raw).substringBefore("```")
    val start = text.indexOf('{')
    val end = text.lastIndexOf('}')
    require(start >= 0 && end > start) { "No JSON object found in the agent reply." }
    val data = AppJson.decodeFromString<ReturnData>(text.substring(start, end + 1))
    require(data.status == Task.STATUS_DONE || data.status == Task.STATUS_FAILED) {
        "status must be done or failed, got '${data.status}'."
    }
    return data
}