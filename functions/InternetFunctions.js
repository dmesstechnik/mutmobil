

export const checkInternetConnection = async () => { 
    try { 
        const response = await fetch("https://www.google.com", { method: "HEAD" }); 
        return response.ok; 
    } catch (error) {
         
        return false; 
    }
};