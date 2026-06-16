3 strategies:
1. Fixed size: Its split every 512 characeters with 64 overlap. The pros are that its simple, fast and predictable. The cons are that it ignores meaning boundaries and can fragment sentences, tables and lists.
2. Recursive character splitting: Its tries to split on paragpaphs, sentences, words and characters. It stops when chunk is small enough. The pros ate that it respects natural text boundaries wherever possible. The cons are that its still charecetr based and can fragment charecters and sentences.
3. semantic chunking: It embdes each sentence, measures similarity betweeb adjacent sentences and splits where similarities drop signficantly. The pros are that unlike others, it splits at actual meaning boundaries and keeps complete concepts together. The cons are that its expensive and requirs embedding every sentence.

4. Recursive function:
   
   def _split_text_recursive(
    text: str,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
    separators: list = ["\n\n", ". ", " ", ""]
) -> list[str]:
    
    # Base case — checks whether text is smaller than chunk size
    if len(text) <= chunk_size:
        return [text.strip()]
    
    # Try each separator one at a time
    parts = [text]
    for separator in separators:
        if separator == "":
            # Last resort — fall back to fixed size
            return _split_text(text, chunk_size, overlap)
        
        parts = text.split(separator)
        if len(parts) > 1:
            break
    
    # Reassemble chunks with overlap
    chunks = []
    current_chunk = ""
    
    for part in parts:
        if len(current_chunk) + len(separator) + len(part) <= chunk_size:
            current_chunk = current_chunk + separator + part if current_chunk else part
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = current_chunk[-overlap:] + separator + part
    
    # Filter out empty strings before returning
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return [c for c in chunks if c]

   How to test retrieval quality?
   Retrieval quality can be tested based on how the reposne of the LLM is, or rather how accurate it is with respect to the query. More accurate implies that the retrieval quality is better. Write 10 test questions with known answers, run both chunking strategies, count how many of the top 4 returned chunks actually contain the answer. 

   Rcursive splitting for thhis corpus size is better since semantic chunking is expensive and for this small data, might be an overkill. Whereas recursice character splitting is vetetr than fixed size since it respects text boundaries wherever possible. 
