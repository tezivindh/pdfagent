# TEST_CASES.md

## SAMPLE PDF: RBI Annual Report 2023-24
Download: [https://rbi.org.in/Scripts/AnnualReportPublications.aspx](https://rbi.org.in/Scripts/AnnualReportPublications.aspx)
(Publicly available, real enterprise document — ideal for evaluation)

---

## 5 VALID QUERIES:

**1. A question about monetary policy objectives**
- **Query:** What are the primary objectives of the monetary policy according to the report?
- **Expected Behavior:** The agent should extract the monetary policy objectives mentioned in the report, citing the relevant pages.
- **Hallucination Indicator:** Mentioning objectives not in the document, or drawing on general economic theory not stated in the report.

**2. A question about a specific statistic or figure**
- **Query:** What was the real GDP growth rate for the year 2023-24?
- **Expected Behavior:** The agent must accurately report the specific figure stated in the report and provide the page number.
- **Hallucination Indicator:** Providing a generic GDP growth rate, or confusing it with nominal GDP without the report's backing.

**3. A definition of a term used in the document**
- **Query:** How does the report define "core inflation"?
- **Expected Behavior:** Provides the definition strictly based on the text of the Annual Report.
- **Hallucination Indicator:** Using an external dictionary definition that contradicts or expands upon the report's definition.

**4. A question about key recommendations or policy actions**
- **Query:** What are the key recommendations for strengthening the banking sector?
- **Expected Behavior:** Lists the exact recommendations provided, with clear citations.
- **Hallucination Indicator:** Suggesting generic banking reforms not specified in the document.

**5. A synthesis question about two related sections**
- **Query:** How does the report link inflation trends to the current monetary policy stance?
- **Expected Behavior:** Synthesizes information from both the inflation and monetary policy sections, accurately reflecting the report's analysis.
- **Hallucination Indicator:** Drawing conclusions that make logical sense but are absent from the document's text.

---

## 3 INVALID / OUT-OF-SCOPE QUERIES:

**1. A general knowledge question unrelated to the document**
- **Query:** What is the capital of France?
- **Expected Behavior:** Graceful refusal. Refusal text should contain "out of scope" and state that the information cannot be found in the document.
- **Failure Indicator:** Answering "Paris" instead of refusing.

**2. A question about current events after the document's publication date**
- **Query:** What is the RBI's policy stance for 2025?
- **Expected Behavior:** Graceful refusal. The agent should state that the document does not cover information for 2025.
- **Failure Indicator:** Guessing or making up a policy stance for 2025 based on past trends.

**3. A question that sounds finance-related but is about a different institution**
- **Query:** What were the profits of the Federal Reserve in 2023?
- **Expected Behavior:** Graceful refusal. The agent must acknowledge that the Federal Reserve's profits are not mentioned in this RBI report.
- **Failure Indicator:** Providing external facts about the Federal Reserve.

---

## REPRODUCIBILITY:

Include `curl` commands for both valid and invalid queries. Ensure you replace `YOUR_CONVERSATION_ID` with the actual session ID.

**Valid Query Example:**
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What was the real GDP growth rate for the year 2023-24?", "conversation_id": "YOUR_CONVERSATION_ID"}'
```

**Invalid Query Example:**
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the capital of France?", "conversation_id": "YOUR_CONVERSATION_ID"}'
```
