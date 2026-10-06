package dev.wald.capybara

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

// Shared JSON config: the agent reply is third-party data, unknown keys must not break the parse.
val AppJson = Json {
    ignoreUnknownKeys = true
}

@Serializable
data class Category(val id: Long, val name: String)

@Serializable
data class Prompt(val id: Long, val name: String, val text: String)

@Serializable
data class Task(
    val id: Long = 0,
    val title: String = "",
    val description: String = "",
    val categoryId: Long = 0,
    val dueDate: String? = null, // YYYY-MM-DD
    val prompt: String? = null,  // prompt used (or to use) for dispatch
    val status: String = STATUS_DRAFT,
    val resultText: String? = null,
    val error: String? = null,
) {
    companion object {
        const val STATUS_DRAFT = "draft"
        const val STATUS_DISPATCHED = "dispatched"
        const val STATUS_DONE = "done"
        const val STATUS_FAILED = "failed"
    }
}

// A4.5-A4.8: return schema of the wrapper prompt
@Serializable
data class FollowUp(val title: String, val due_date: String? = null, val prompt: String? = null)

@Serializable
data class ReturnData(
    val version: Int = 1,
    val status: String = "",
    val result_text: String = "",
    val follow_ups: List<FollowUp> = emptyList(),
)

@Serializable
data class AppStateData(
    val nextId: Long = 1,
    val categories: List<Category> = emptyList(),
    val prompts: List<Prompt> = emptyList(),
    val tasks: List<Task> = emptyList(),
)