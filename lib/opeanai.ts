import OpenAI from 'openai';

export const queryOpenAI = async (query: string) => {
    // Set up OpenAI API
    const openai = new OpenAI();

    // prompt to be fed into the chat-gpt-api
    const userPrompt = `Extract the top 5 queries that such a user profile would run to find content interesting for him given their topics of interest that you can extract from the following data. Queries don't have to be very specific and they used to suggest the best content for the user to consume. POAPs and Digital collectibles is not a topic. - ${query}\n\n\n\n  Output should be in a string format like the following: query1, query2, query3, query4, query5`;

    // Generate topics using OpenAI API
    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 150,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.6,
    });

    // Extract topics from generated string using regular expression
    const message = response.choices[0];
    const json = message.message;
    return JSON.stringify(json.content);
};
