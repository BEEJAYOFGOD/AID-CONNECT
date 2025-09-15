import axios from "axios";

const useFetch = async (url, body, headers, type) => {
    if (!type) {
        throw new Error("Request type is required");
    }

    const method = type.toLowerCase();

    try {
        let response;

        switch (method) {
            case "post":
            case "put":
                response = await axios[method](url, body, { headers });
                break;

            case "get":
                response = await axios.get(url, { headers });
                break;

            case "delete":
                response = await axios.delete(url, {
                    data: body,
                    headers: headers,
                });
                break;

            default:
                throw new Error(`Unsupported request type: ${type}`);
        }

        return {
            error: false,
            data: response.data, // Remove unnecessary await
        };
    } catch (err) {
        return {
            error: true,
            data: err.response?.data || err.message,
        };
    }
};

export default useFetch;
