import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_community.vectorstores import FAISS

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

# Step 1 — LLM
llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0,
    api_key=api_key
)

# Step 2 — Prompt Template
prompt = ChatPromptTemplate.from_template("""
You are a financial advisor. Use the following context to answer the question.
Only use information from the context provided.

Context: {context}

Question: {question}

Answer:
""")

# Step 3 — Output Parser
output_parser = StrOutputParser()

# Step 4 — Retriever
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",
    api_key=api_key
)

texts = [
    "Emergency funds should cover 3-6 months of expenses.",
    "Aggressive investors can allocate up to 90% in stocks.",
    "Debt-to-income ratio should not exceed 43%.",
    "Index funds outperform actively managed funds over long periods.",
    "Retirement savings should be 15% of gross income."
]

vectorstore = FAISS.from_texts(texts, embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 2})

# Step 5 — RAG Chain
def format_docs(docs):
    return "\n\n".join([d.page_content for d in docs])

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | output_parser
)

# Test
result = rag_chain.invoke("How much should I save for retirement?")
print(result)