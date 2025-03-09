import React, { useState, useEffect } from 'react';
import { OpenAI } from 'openai';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import './PuzzleCreator.css'; // Reusing the same CSS file for now

function LLMPuzzleCreator({ setPuzzlePieces, setProblem, onGeneratePuzzle }) {
  const [problemStatement, setProblemStatement] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKeyEntered, setApiKeyEntered] = useState(true); // Default to true if using env variable
  const [generatedSteps, setGeneratedSteps] = useState([]); // Local state to store generated steps
  const [generatedProblem, setGeneratedProblem] = useState(''); // Local state to store generated problem
  const [numSteps, setNumSteps] = useState(10); // Default to 10 steps
  
  // Check if API key is available from environment variable
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      setApiKeyEntered(false);
      console.warn('OpenAI API key not found in environment variables. Please add your API key to .env file.');
    }
  }, []);
  
  // Effect to handle processing generated steps
  useEffect(() => {
    // Only proceed if we have generated steps and a problem
    if (generatedSteps.length > 0 && generatedProblem) {
      console.log("Applying generated steps to parent component state");
      // Update parent component state
      setProblem(generatedProblem);
      setPuzzlePieces(generatedSteps);
      // After state updates, trigger the puzzle creation with a delay
      setTimeout(() => {
        console.log("Calling onGeneratePuzzle with updated state");
        onGeneratePuzzle();
      }, 500); // Increased delay to 500ms to ensure state updates
    }
  }, [generatedSteps, generatedProblem, setProblem, setPuzzlePieces, onGeneratePuzzle]);
  
  const handleGenerateProof = async () => {
    if (!problemStatement.trim()) {
      alert('Please enter a problem statement first.');
      return;
    }
    
    // Verify API key is available
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      setError('OpenAI API key not found. Please add it to your .env file as NEXT_PUBLIC_OPENAI_API_KEY.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // For client-side usage, normally not recommended for production
      });
      
      // Define the JSON schema (for reference)
      const jsonSchema = {
        type: "object",
        properties: {
          problem_statement: {
            type: "string",
            description: "The original problem statement, formatted in LaTeX. ONLY USE \\text{} FOR PLAIN ENGLISH, DO NOT USE ANY BACKSLASHES OR ANY OTHER FORMAT SPECIFCERS JUST RAW LATEX THIS WILL BE RENDERED WITH KATEX"
          },
          proof_steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                order: {
                  type: "integer",
                  description: "The numerical order of this step in the proof"
                },
                content: {
                  type: "string",
                  description: "The step's content in LaTeX format ONLY USE \\text{} FOR PLAIN ENGLISH, DO NOT USE ANY BACKSLASHES OR ANY OTHER FORMAT SPECIFCERS JUST RAW LATEX THIS WILL BE RENDERED WITH KATEX"
                },
                explanation: {
                  type: "string",
                  description: "A brief explanation of this step's reasoning (in plain text, not LaTeX)"
                }
              },
              required: ["order", "content"],
              additionalProperties: false
            }
          }
        },
        required: ["problem_statement", "proof_steps"],
        additionalProperties: false
      };
      
      // Make the API call
      const response = await openai.chat.completions.create({
        model: "o3-mini",
        messages: [
          {
            role: "system",
            content: `You are a mathematics professor specializing in creating step-by-step proofs for mathematical problems. 

IMPORTANT LaTeX FORMATTING INSTRUCTIONS:
1. Use ONLY \\text{} for plain English text, like: \\text{Let} V \\text{be a vector space}
2. For mathematical symbols and expressions, write them directly (properly escaped for JSON)
3. Do NOT use $, $$, \\(, \\), or any other delimiters around expressions
4. DO use LaTeX commands for mathematical symbols like \\rightarrow, \\bigoplus, \\cap, etc.

IMPORTANT JSON FORMATTING:
1. Remember all backslashes \\ must be escaped with another backslash \\\\ in JSON strings
2. The LaTeX command \\text{} should be written as "\\\\text{}" in the JSON

CORRECT FORMAT EXAMPLE:
"\\\\text{Let } V \\\\text{ be a finite dimensional vector space and let } T: V \\\\rightarrow V \\\\text{ be a linear transformation.}"

Generate clear, concise steps that logically build on each other. Number each step and make sure the sequence flows logically from start to finish. Your response should be in valid JSON format.`
          },
          {
            role: "user",
            content: `Create a step-by-step mathematical proof for the following problem: ${problemStatement}. 
            
Please provide your response as a JSON object with a problem_statement field containing the LaTeX formatted problem and a proof_steps array where each step has an order number and content in LaTeX format.

IMPORTANT: Your proof must contain EXACTLY ${numSteps} steps - no more, no less.

REMEMBER THE LATEX FORMATTING RULES:
- Use \\text{} ONLY for plain English text portions
- Write mathematical symbols and expressions directly (no extra backslashes)
- Do NOT use $, $$, \\(, \\), or any delimiters
- Mathematical operators like \\rightarrow, \\bigoplus should be used directly

Example of properly formatted step:
"\\\\text{Since } V = R(T) + N(T) \\\\text{, we know that any vector } v \\in V \\\\text{ can be written as } v = r + n \\\\text{ where } r \\in R(T) \\\\text{ and } n \\in N(T)."

Ensure all ${numSteps} steps build logically on each other.
Each step should be meaningful and contribute to the overall proof.`
          }
        ],
        response_format: {
          type: "json_object"
        }
      });
      
      console.log("API Response:", response);
      
      // Parse the response
      let result;
      try {
        // Try normal parsing first
        result = JSON.parse(response.choices[0].message.content);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        
        // If normal parsing fails, try to fix common LaTeX escaping issues
        const content = response.choices[0].message.content;
        
        // First attempt: Replace problematic backslash sequences with escaped versions
        const fixedContent = content
          .replace(/\\(?!(\\|"))/g, '\\\\') // Escape single backslashes that aren't already escaped
          .replace(/\\\\text/g, '\\text')   // Fix double escaping of \text commands
          .replace(/\\\\(?=rightarrow|bigoplus|cap|in|dim)/g, '\\'); // Fix other common LaTeX commands
          
        console.log("Attempting to fix JSON:", fixedContent);
        
        try {
          result = JSON.parse(fixedContent);
        } catch (secondError) {
          console.error("Failed to parse even after fixing:", secondError);
          
          // Last resort - try manually extracting the data
          alert("Error parsing the response. Please try again.");
          throw new Error("Failed to parse API response: " + error.message);
        }
      }
      
      console.log("Parsed result:", result);
      
      // Validate the required fields
      if (!result.problem_statement || !result.proof_steps || !Array.isArray(result.proof_steps) || result.proof_steps.length === 0) {
        throw new Error('The API response does not contain the required fields or has empty proof steps');
      }
      
      // Format the steps for our puzzle piece format
      const steps = result.proof_steps.map(step => ({
        id: `step-${step.order || Date.now()}`, // Fallback to timestamp if order is missing
        content: step.content,
        order: step.order || 0, // Fallback to 0 if order is missing
        explanation: step.explanation || ''
      }));
      
      console.log("Formatted steps:", steps);
      
      // Make sure we have at least one step before proceeding
      if (steps.length === 0) {
        throw new Error('No valid proof steps were generated');
      }
      
      // Update local state with generated data
      setGeneratedProblem(result.problem_statement);
      setGeneratedSteps(steps);
      
    } catch (error) {
      console.error('Error generating proof:', error);
      setError(error.message || 'Failed to generate proof. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="puzzle-creator">
      <div className="problem-section">
        <h2>LLM-Generated Mathematical Proof</h2>
        <p>Enter a mathematical problem to automatically generate a step-by-step proof.</p>
        
        {!apiKeyEntered && (
          <div className="api-key-notice">
            <p>Please add your OpenAI API key to the .env file as NEXT_PUBLIC_OPENAI_API_KEY.</p>
          </div>
        )}
        
        <textarea
          value={problemStatement}
          onChange={(e) => setProblemStatement(e.target.value)}
          placeholder="Enter a mathematical problem (e.g., 'Prove that the sum of the first n odd numbers is n^2')"
          rows={4}
        />
        
        <div className="preview">
          <h3>Preview:</h3>
          {problemStatement ? (
            <div className="math-preview">
              <InlineMath math={problemStatement} />
            </div>
          ) : (
            <p>No problem statement yet</p>
          )}
        </div>
        
        <div className="step-selector">
          <h3>Number of Proof Steps:</h3>
          <div className="step-buttons">
            {[5, 10, 15, 20].map(steps => (
              <button
                key={steps}
                className={`step-button ${numSteps === steps ? 'active' : ''}`}
                onClick={() => setNumSteps(steps)}
              >
                {steps} Steps
              </button>
            ))}
          </div>
        </div>
        
        <button 
          className="generate-button"
          onClick={handleGenerateProof}
          disabled={isLoading || !problemStatement.trim() || !apiKeyEntered}
        >
          {isLoading ? 'Generating...' : `Generate ${numSteps}-Step Proof & Puzzle`}
        </button>
        
        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LLMPuzzleCreator; 