export function uploadAsset() {
    const defaultPayload = {
        projectName: "defaultName",
        type: "xwlak-copilot-assisted",
        userLdap:"pbakliwal",
        aemURL:"https://author-p121371-e1189853.adobeaemcloud.com/",
        images: [
            {
                importedUrl: "https://d3e5s7kqhuzljs.cloudfront.net/36F17006660AF1130A495CAB@821b1f78631c0ced495c57.e/images/22eea5d3-545c-48d7-bb7c-5b5adebc40c2/8f004eb1-8b18-4d99-ad5e-10ba6d5482f4.jpg",
                pathToModify: "defaultPath",
                name: "8f004eb1-8b18-4d99-ad5e-10ba6d5482f4.jpg"
            }
        ]
    };

    //const payload = { ...defaultPayload, ...updates };
    console.log("payload for assets:", defaultPayload);

    // First try with CORS mode
    return fetch('https://275323-918sangriatortoise-stage.adobeio-static.net/api/v1/web/dx-excshell-1/assets', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': window.location.origin
        },
        body: JSON.stringify(defaultPayload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .catch(error => {
        console.error('CORS request failed:', error);
        // If CORS fails, try with no-cors mode
        console.log('Attempting no-cors mode...');
        return fetch('https://275323-918sangriatortoise-stage.adobeio-static.net/api/v1/web/dx-excshell-1/assets', {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(defaultPayload)
        })
        .then(response => {
            // With no-cors, we can't read the response
            console.log('Request sent in no-cors mode')
            console.log('response from upload:', response);
            return { status: 'sent', message: 'Request sent in no-cors mode' };
        });
    })
    .then(data => {
        console.log('Success:', data);
        return data;
    })
    .catch(error => {
        console.error('All attempts failed:', error);
        throw error;
    });
}