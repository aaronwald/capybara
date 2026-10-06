package dev.wald.capybara

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Credentials.init(this)
        val store = Store(this)
        setContent { App(store) }
    }
}

private val DUE_DATE_REGEX = Regex("""\d{4}-\d{2}-\d{2}""")

@Composable
fun App(store: Store) {
    var screen by remember { mutableStateOf("tasks") }
    var editing by remember { mutableStateOf<Task?>(null) }

    Scaffold(bottomBar = { Navigation(screen) { screen = it; editing = null } }) { pad ->
        Box(Modifier.padding(pad).fillMaxSize()) {
            when (screen) {
                "tasks" -> {
                    val task = editing
                    if (task == null) TasksScreen(store) { editing = it }
                    else TaskEditor(store, task, onClose = { editing = null })
                }
                "prompts" -> PromptsScreen(store)
                "settings" -> SettingsScreen()
            }
        }
    }
}

@Composable
private fun Navigation(screen: String, onSelect: (String) -> Unit) {
    Row(
        Modifier
            .fillMaxWidth()
            .padding(8.dp),
        horizontalArrangement = Arrangement.SpaceEvenly,
    ) {
            listOf("tasks", "prompts", "settings").forEach { s ->
                TextButton(onClick = { onSelect(s) }) {
                    Text(if (screen == s) "● ${s.replaceFirstChar { it.uppercase() }}" else s.replaceFirstChar { it.uppercase() })
                }
            }
    }
}

// ---------- Tasks ----------

@Composable
fun TasksScreen(store: Store, onEdit: (Task) -> Unit) {
    var newCategory by remember { mutableStateOf<String?>(null) }

    Box(Modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize()) {
            Text(
                "Tasks",
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(16.dp),
            )
            LazyColumn(Modifier.fillMaxSize()) {
                store.categories.forEach { cat ->
                    item(key = "cat-${cat.id}") {
                        Row(
                            Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Text(cat.name, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                            if (cat.id != 0L) TextButton(onClick = { store.deleteCategory(cat.id) }) { Text("delete") }
                        }
                    }
                    val catTasks = store.tasks.filter { it.categoryId == cat.id }
                    if (catTasks.isEmpty()) {
                        item(key = "cat-${cat.id}-empty") {
                            Text(
                                "  (no tasks)",
                                style = MaterialTheme.typography.bodySmall,
                                modifier = Modifier.padding(horizontal = 16.dp),
                            )
                        }
                    }
                    items(catTasks, key = { it.id }) { t ->
                        TaskRow(t, Modifier.padding(horizontal = 8.dp)) { onEdit(t) }
                    }
                }
            }
        }

        Column(Modifier.align(Alignment.BottomEnd).padding(bottom = 16.dp, end = 16.dp)) {
            FloatingActionButton(
                onClick = { newCategory = "" },
                modifier = Modifier.padding(bottom = 8.dp),
            ) { Text("+ cat") }
            ExtendedFloatingActionButton(onClick = { onEdit(Task()) }) { Text("New task") }
        }
    }

    newCategory?.let {
        NameDialog(
            title = "New category",
            onDismiss = { newCategory = null },
            onOk = { name ->
                if (name.isNotBlank()) store.addCategory(name.trim())
                newCategory = null
            },
        )
    }
}

@Composable
private fun TaskRow(task: Task, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Card(onClick = onClick, modifier = modifier.fillMaxWidth().padding(vertical = 2.dp)) {
        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(task.title, fontWeight = FontWeight.SemiBold)
                task.dueDate?.let { Text("due $it", style = MaterialTheme.typography.bodySmall) }
                task.error?.let { Text("error: $it", style = MaterialTheme.typography.bodySmall, color = Color(0xFFB00020)) }
            }
            Text(task.status, color = statusColor(task.status), style = MaterialTheme.typography.labelMedium)
        }
    }
}

private fun statusColor(status: String): Color = when (status) {
    Task.STATUS_DONE -> Color(0xFF2E7D32)
    Task.STATUS_DISPATCHED -> Color(0xFF1565C0)
    Task.STATUS_FAILED -> Color(0xFFB00020)
    else -> Color.Gray
}

// ---------- Task editor + dispatch ----------

@Composable
fun TaskEditor(store: Store, initial: Task, onClose: () -> Unit) {
    // recomputed each pass: seeds the remembers on first composition, shows live status later
    val current = store.task(initial.id)
    var title by remember { mutableStateOf(current?.title ?: initial.title) }
    var description by remember { mutableStateOf(current?.description ?: initial.description) }
    var categoryId by remember { mutableStateOf(current?.categoryId ?: initial.categoryId) }
    var dueDate by remember { mutableStateOf(current?.dueDate ?: initial.dueDate ?: "") }
    var prompt by remember { mutableStateOf(current?.prompt ?: initial.prompt ?: "") }
    var promptChoice by remember { mutableStateOf("Custom") } // Custom or a prompt name
    var target by remember { mutableStateOf("openroute") }
    var dispatching by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    fun composed(): Task = (current ?: initial).copy(
        title = title.trim(),
        description = description.trim(),
        categoryId = categoryId,
        dueDate = dueDate.trim().ifBlank { null },
        prompt = prompt.trim().ifBlank { null },
    )

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            TextButton(onClick = onClose) { Text("← Tasks") }
            Spacer(Modifier.weight(1f))
            if (initial.id != 0L) {
                TextButton(onClick = { store.deleteTask(initial.id); onClose() }) { Text("Delete") }
            }
        }

        OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("Title") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = description, onValueChange = { description = it }, label = { Text("Description") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(
            value = dueDate,
            onValueChange = { dueDate = it },
            label = { Text("Due date (YYYY-MM-DD, optional)") },
            modifier = Modifier.fillMaxWidth(),
        )

        Dropdown(
            label = "Category",
            selected = store.categories.find { it.id == categoryId }?.name ?: "General",
            options = store.categories.map { it.name },
        ) { name -> store.categories.find { it.name == name }?.let { categoryId = it.id } }

        Dropdown(
            label = "Prompt",
            selected = promptChoice,
            options = listOf("Custom") + store.prompts.map { it.name },
        ) { choice ->
            promptChoice = choice
            store.prompts.find { it.name == choice }?.let { prompt = it.text }
        }
        if (promptChoice == "Custom") {
            OutlinedTextField(
                value = prompt,
                onValueChange = { prompt = it },
                label = { Text("Custom prompt") },
                modifier = Modifier.fillMaxWidth(),
            )
        }

        Dropdown(
            label = "Target",
            selected = target,
            options = Targets.all.map { it.name },
        ) { target = it }

        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            TextButton(
                onClick = {
                    val trimmed = dueDate.trim()
                    if (title.isBlank() || (trimmed.isNotEmpty() && !DUE_DATE_REGEX.matches(trimmed))) {
                        message = "Give the task a title and a due date in the YYYY-MM-DD format."
                        return@TextButton
                    }
                    store.saveTask(composed())
                    message = "Saved."
                },
            ) { Text("Save") }
            if (dispatching) {
                CircularProgressIndicator(Modifier.width(24.dp).height(24.dp))
            } else {
                TextButton(
                    onClick = {
                        if (title.isBlank() || prompt.isBlank()) {
                            message = "Give the task a title and a prompt before dispatch."
                            return@TextButton
                        }
                        dispatching = true
                        scope.launch {
                            message = dispatch(store, composed(), target)
                            dispatching = false
                        }
                    },
                ) { Text("Dispatch") }
            }
        }

        current?.let { t ->
            Text("Status: ${t.status}", color = statusColor(t.status))
            t.resultText?.let { if (it.isNotBlank()) Text("Result:\n$it") }
            t.error?.let { Text("Error:\n$it", color = Color(0xFFB00020)) }
        }
        message?.let { Text(it, color = Color(0xFF1565C0)) }
    }
}

// A2.8, A4.3, A4.4, A7.1, A7.2: the dispatch round trip; returns a user-facing message
private suspend fun dispatch(store: Store, task: Task, target: String): String {
    val dispatched = store.saveTask(task.copy(status = Task.STATUS_DISPATCHED, error = null))
    val result = Targets.byName(target).dispatch(wrapperPrompt(dispatched, dispatched.prompt ?: ""))

    return when {
        result.isFailure -> {
            val error = result.exceptionOrNull()?.message ?: "unknown error"
            store.saveTask(dispatched.copy(status = Task.STATUS_FAILED, error = error))
            "Dispatch failed: $error" // A7.3
        }
        else -> try {
            val data = parseReturnData(result.getOrThrow())
            store.saveTask(
                dispatched.copy(
                    status = data.status,
                    resultText = data.result_text,
                    error = if (data.status == Task.STATUS_FAILED) data.result_text else null,
                )
            )
            if (data.follow_ups.isNotEmpty()) store.addFollowUps(dispatched, data.follow_ups)
            "Dispatch ${data.status}; ${data.follow_ups.size} follow-up(s) created."
        } catch (e: Exception) {
            val error = e.message ?: "invalid return data"
            store.saveTask(dispatched.copy(status = Task.STATUS_FAILED, error = error))
            "Dispatch failed: $error" // A7.2/A7.3
        }
    }
}

// ---------- Prompts ----------

@Composable
fun PromptsScreen(store: Store) {
    var edit by remember { mutableStateOf<Prompt?>(null) }

    Column(Modifier.fillMaxSize()) {
        Row(
            Modifier.fillMaxWidth().padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("Prompt library", style = MaterialTheme.typography.headlineSmall, modifier = Modifier.weight(1f))
            TextButton(onClick = { edit = Prompt(0, "", "") }) { Text("New") }
        }
        if (store.prompts.isEmpty()) {
            Text("No prompts yet.", modifier = Modifier.padding(16.dp))
        }
        LazyColumn {
            items(store.prompts, key = { it.id }) { p ->
                Card(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 2.dp)) {
                    Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(p.name, fontWeight = FontWeight.SemiBold)
                            Text(
                                p.text,
                                style = MaterialTheme.typography.bodySmall,
                                maxLines = 2,
                            )
                        }
                        TextButton(onClick = { edit = p }) { Text("edit") }
                        TextButton(onClick = { store.deletePrompt(p.id) }) { Text("del") }
                    }
                }
            }
        }
    }

    edit?.let { p ->
        PromptDialog(prompt = p, onDismiss = { edit = null }) { name, text ->
            store.savePrompt(p.copy(name = name, text = text))
            edit = null
        }
    }
}

@Composable
private fun PromptDialog(prompt: Prompt, onDismiss: () -> Unit, onOk: (String, String) -> Unit) {
    var name by remember { mutableStateOf(prompt.name) }
    var text by remember { mutableStateOf(prompt.text) }
    androidx.compose.ui.window.Dialog(onDismissRequest = onDismiss) {
        Card(Modifier.padding(16.dp)) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(if (prompt.id == 0L) "New prompt" else "Edit prompt", fontWeight = FontWeight.Bold)
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Name") })
                OutlinedTextField(value = text, onValueChange = { text = it }, label = { Text("Text") })
                Row {
                    TextButton(onClick = onDismiss) { Text("Cancel") }
                    Spacer(Modifier.weight(1f))
                    TextButton(
                        onClick = { if (name.isNotBlank() && text.isNotBlank()) onOk(name.trim(), text.trim()) },
                    ) { Text("Save") }
                }
            }
        }
    }
}

// ---------- Settings ----------

@Composable
fun SettingsScreen() {
    var key by remember { mutableStateOf(Credentials.openRouterKey) }
    var model by remember { mutableStateOf(Credentials.openRouterModel) }
    var hermesUrl by remember { mutableStateOf(Credentials.hermesProxyUrl) }
    var hermesModel by remember { mutableStateOf(Credentials.hermesModel) }
    var saved by remember { mutableStateOf(false) }

    fun save() {
        Credentials.openRouterKey = key.trim()
        Credentials.openRouterModel = model.trim()
        Credentials.hermesProxyUrl = hermesUrl.trim()
        Credentials.hermesModel = hermesModel.trim()
        saved = true
    }

    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Settings", style = MaterialTheme.typography.headlineSmall)
        OutlinedTextField(
            value = key,
            onValueChange = { key = it; saved = false },
            label = { Text("OpenRouter API key") },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value = model,
            onValueChange = { model = it; saved = false },
            label = { Text("OpenRouter model id") },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value = hermesUrl,
            onValueChange = { hermesUrl = it; saved = false },
            label = { Text("Hermes proxy URL") },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value = hermesModel,
            onValueChange = { hermesModel = it; saved = false },
            label = { Text("Hermes model id") },
            modifier = Modifier.fillMaxWidth(),
        )
        TextButton(onClick = { save() }) { Text("Save") }
        if (saved) Text("Saved. Keys stay in Android Keystore-backed storage.", color = Color(0xFF2E7D32))
    }
}

// ---------- shared bits ----------

@Composable
private fun Dropdown(
    label: String,
    selected: String,
    options: List<String>,
    onSelect: (String) -> Unit,
) {
    var open by remember { mutableStateOf(false) }
    Box {
        AssistChip(onClick = { open = true }, label = { Text("$label: $selected") })
        DropdownMenu(expanded = open, onDismissRequest = { open = false }) {
            options.forEach { opt ->
                DropdownMenuItem(text = { Text(opt) }, onClick = { onSelect(opt); open = false })
            }
        }
    }
}

@Composable
private fun NameDialog(
    title: String,
    onDismiss: () -> Unit,
    onOk: (String) -> Unit,
) {
    var name by remember { mutableStateOf("") }
    androidx.compose.ui.window.Dialog(onDismissRequest = onDismiss) {
        Card(Modifier.padding(16.dp)) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(title, fontWeight = FontWeight.Bold)
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Name") })
                Row {
                    TextButton(onClick = onDismiss) { Text("Cancel") }
                    Spacer(Modifier.weight(1f))
                    TextButton(onClick = { onOk(name) }) { Text("Save") }
                }
            }
        }
    }
}