import { showLoader, hideLoader, showPopup } from './ui-utils.js';

// Function to get the authentication token
const getAuthToken = () => {
    try {
        const tokenKey = 'adobeid_ims_access_token/demo-copilot/false/AdobeID,openid';
        const tokenData = localStorage.getItem(tokenKey);
        
        if (!tokenData) {
            console.error('No token found in localStorage');
            return null;
        }

        const parsedToken = JSON.parse(tokenData);
        return parsedToken.tokenValue;
    } catch (error) {
        console.error('Error parsing token from localStorage:', error);
        return null;
    }
};

// Function to extract project and demo IDs from URL parameter
const extractIds = (paramValue) => {
    if (!paramValue) return null;
    const parts = paramValue.split('/');
    if (parts.length >= 2) {
        return {
            projectId: parts[0],
            demoId: parts[1]
        };
    }
    return null;
};

// Function to fetch project data from API
const fetchProjectData = async (projectId) => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await fetch(`https://btci3qnv43.execute-api.us-east-1.amazonaws.com/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching project data:', error);
        throw error;
    }
};

// Function to process edits and create payload updates
const processEdits = (demo) => {
    if (!demo || !demo.edits) return null;

    return demo.edits.map(edit => ({
        importedUrl: edit.sourceURL || '',
        pathToModify: edit.xpath || '',
        name: edit.sourceImageId || '',
        originalEdit: edit // Keep the original edit data for reference
    }));
};

// Function to get payload updates
const getPayloadUpdates = async () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const copilotParam = urlParams.get('copilotEditor') || urlParams.get('copilotPreview');
        const ids = extractIds(copilotParam);
        
        if (!ids) {
            console.error('Invalid project/demo IDs in URL');
            return null;
        }

        const projectData = await fetchProjectData(ids.projectId);
        
        // Find the specific demo in the project data
        const targetDemo = projectData.demos.find(demo => demo.id === ids.demoId);
        
        if (!targetDemo) {
            console.error('Demo not found in project data');
            return null;
        }

        const updates = processEdits(targetDemo);
        
        if (!updates) {
            console.error('No valid updates found in demo data');
            return null;
        }

        return {
            projectName: projectData.name || "defaultName",
            type: "xwlak-copilot-assisted",
            userLdap: "pbakliwal",
            aemURL: "https://author-p121371-e1189853.adobeaemcloud.com/",
            images: updates
        };
    } catch (error) {
        console.error('Error getting payload updates:', error);
        return null;
    }
};

export async function uploadAsset() {
    try {
        showLoader();
        
        // Check for token before proceeding
        const token = getAuthToken();
        if (!token) {
            hideLoader();
            showPopup('Authentication token not found. Please log in again.', 'notice');
            return { status: 'error', message: 'Authentication token not found' };
        }

        // Get updates from API
        const updates = await getPayloadUpdates();
        
        // Return early if no updates are available
        if (!updates) {
            hideLoader();
            showPopup('No updates available for asset upload', 'notice');
            return { status: 'skipped', message: 'No updates available' };
        }

        console.log("payload for assets:", updates);

        // First try with CORS mode
        const response = await fetch('https://275323-918sangriatortoise-stage.adobeio-static.net/api/v1/web/dx-excshell-1/assets', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Origin': window.location.origin
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        hideLoader();
        showPopup('Assets uploaded successfully!', 'success');
        console.log('Success:', data);
        return data;

    } catch (error) {
        console.error('CORS request failed:', error);
        // If CORS fails, try with no-cors mode
        console.log('Attempting no-cors mode...');
        try {
            const response = await fetch('https://275323-918sangriatortoise-stage.adobeio-static.net/api/v1/web/dx-excshell-1/assets', {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            console.log('Request sent in no-cors mode');
            console.log('response from upload:', response);
            hideLoader();
            showPopup('Assets uploaded in no-cors mode', 'notice');
            return { status: 'sent', message: 'Request sent in no-cors mode' };
        } catch (fallbackError) {
            console.error('All attempts failed:', fallbackError);
            hideLoader();
            showPopup('Failed to upload assets. Please try again.', 'notice');
            throw fallbackError;
        }
    }
}