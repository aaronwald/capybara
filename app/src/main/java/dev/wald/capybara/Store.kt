package dev.wald.capybara

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import java.io.File

// ponytail: whole-state JSON file; move to Room when queries outgrow a linear scan
class Store(context: Context) {

    private val file = File(context.filesDir, "state.json")
    private var state by mutableStateOf(loadOrSeed())

    val categories get() = state.categories
    val prompts get() = state.prompts
    val tasks get() = state.tasks

    private fun loadOrSeed(): AppStateData =
        if (file.exists()) AppJson.decodeFromString<AppStateData>(file.readText())
        else AppStateData(categories = listOf(Category(0, "General")))

    private fun commit(newState: AppStateData) {
        state = newState
        file.writeText(AppJson.encodeToString(AppStateData.serializer(), newState))
    }

    fun task(id: Long): Task? = state.tasks.find { it.id == id }

    fun saveTask(t: Task): Task {
        val s = state
        val task = if (t.id == 0L) t.copy(id = s.nextId) else t
        commit(
            s.copy(
                nextId = if (t.id == 0L) s.nextId + 1 else s.nextId,
                tasks = (s.tasks.filterNot { it.id == task.id } + task).sortedBy { it.id },
            )
        )
        return task
    }

    fun deleteTask(id: Long) = commit(state.copy(tasks = state.tasks.filterNot { it.id == id }))

    fun addCategory(name: String): Category {
        val category = Category(state.nextId, name)
        commit(state.copy(nextId = state.nextId + 1, categories = state.categories + category))
        return category
    }

    fun deleteCategory(id: Long) = commit(
        state.copy(
            categories = state.categories.filterNot { it.id == id },
            tasks = state.tasks.filterNot { it.categoryId == id },
        )
    )

    fun savePrompt(p: Prompt): Prompt {
        val s = state
        val prompt = if (p.id == 0L) p.copy(id = s.nextId) else p
        commit(
            s.copy(
                nextId = if (p.id == 0L) s.nextId + 1 else s.nextId,
                prompts = (s.prompts.filterNot { it.id == prompt.id } + prompt).sortedBy { it.id },
            )
        )
        return prompt
    }

    fun deletePrompt(id: Long) = commit(state.copy(prompts = state.prompts.filterNot { it.id == id }))

    // A2.10/A2.11: follow-ups inherit the parent's category; due date only if returned
    fun addFollowUps(parent: Task, followUps: List<FollowUp>) {
        val s = state
        var id = s.nextId
        val newTasks = followUps.map { f ->
            Task(
                id = id++,
                title = f.title,
                categoryId = parent.categoryId,
                dueDate = f.due_date,
                prompt = f.prompt,
            )
        }
        commit(s.copy(nextId = id, tasks = s.tasks + newTasks))
    }
}