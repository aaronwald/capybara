package dev.wald.capybara

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Test

class DispatchTest {

    @Test
    fun wrapperPromptContainsTaskAndSchema() {
        val p = wrapperPrompt(Task(title = "Fix the build"), "investigate and repair")
        assertTrue("Fix the build" in p)
        assertTrue("\"follow_ups\"" in p)
        assertTrue("\"done\"|\"failed\"" in p)
    }

    @Test
    fun parsesPlainJsonReply() {
        val data = parseReturnData(
            """{"version":1,"status":"done","result_text":"fixed it","follow_ups":[{"title":"Write tests","prompt":"write tests"}]}"""
        )
        assertEquals("done", data.status)
        assertEquals(1, data.follow_ups.size)
        assertEquals("Write tests", data.follow_ups[0].title)
    }

    @Test
    fun parsesFencedJsonReply() {
        val data = parseReturnData("```json\n{\"version\":1,\"status\":\"failed\",\"result_text\":\"no access\"}\n```")
        assertEquals("failed", data.status)
        assertEquals(0, data.follow_ups.size)
    }

    @Test
    fun rejectsBadStatus() {
        try {
            parseReturnData("""{"version":1,"status":"maybe","result_text":"?"}""")
            fail("expected IllegalArgumentException")
        } catch (e: IllegalArgumentException) { /* expected */ }
    }

    @Test
    fun rejectsNonJson() {
        try {
            parseReturnData("I could not do that, sorry.")
            fail("expected IllegalArgumentException")
        } catch (e: IllegalArgumentException) { /* expected */ }
    }
}