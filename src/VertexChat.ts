import {FunctionDeclarationSchemaType, Part, VertexAI} from "@google-cloud/vertexai";
import PromptSync from "prompt-sync";


// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({
    project: "YOUR_PROJECT_ID",
    location: "us-central1"
});
const model = "gemini-1.5-flash-001";

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
    model: model,
    generationConfig: {
        maxOutputTokens: 8192,
        topP: 0.95,
        temperature: 0.0
    },
    tools: [
        {
            googleSearchRetrieval: {

            }
        },
        {
            functionDeclarations: [
                {
                    name: "someFun",
                    description: "Sample function",
                    parameters: {
                        type: FunctionDeclarationSchemaType.OBJECT,
                        properties: {
                            value: {
                                type: FunctionDeclarationSchemaType.STRING,
                                description: "Sample parameter"
                            }
                        },
                        required: ["value"]
                    }
                }
            ]
        }
    ],
});


const chat = generativeModel.startChat({});

async function sendMessage(parts: Array<Part>) {
    const result = await chat.sendMessage(parts);
    const candidate = result?.response?.candidates?.at(0);
    if (undefined === candidate) {
        console.warn("AI: No candidate returned!")
    } else {
        console.info("AI: " + JSON.stringify(candidate));
    }
}

async function generateContent() {
    const prompt = PromptSync({sigint: false});

    while(true) {
        const user = prompt("User: ");
        if (null === user) {
            continue;
        }
        if ("quit" === user) {
            break;
        }
        await sendMessage([{text: user}]);
    }
}

generateContent();
