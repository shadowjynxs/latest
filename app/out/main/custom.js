const { app, BrowserWindow, session } = require('electron');
const { globalShortcut } = require('electron');
const crypto = require('crypto');
const axios = require('axios');

let decrypted_ip_port;

function padPassword(password) {
    const blockSize = 32;
    const paddedPassword = Buffer.alloc(blockSize);
    password.copy(paddedPassword);
    return paddedPassword;
}

function decrypt(encrypted_data, password) {
    const decoded_data = Buffer.from(encrypted_data, 'base64');
    const iv = decoded_data.slice(0, 16);
    const data = decoded_data.slice(16);

    const decipher = crypto.createDecipheriv('aes-256-cfb', padPassword(password), iv);
    const decrypted_data = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted_data.toString('utf-8');
}

// Define your encrypted_ip_port variable here
const encrypted_ip_port = "FMDBYGLQ6ZxNJbxqM4C/uD3xz+U6MXPkn7ZMHfoACrLXORGF6MVr";
const reg_no = "eyrVuh_ZQU9dhSqLoJCODfqBHpjbiRQw";

let password1 = Buffer.from("9000", 'utf-8');
password1 = padPassword(password1);

app.on('ready', () => {
    console.log("App is ready");

    // Use the decrypted IP port here
    decrypted_ip_port = decrypt(encrypted_ip_port, password1);

    // Call the function to send the validation request
    sendValidationRequest();
});

async function sendValidationRequest() {
    // Validate only if not already sent
    console.log("Sending validation request...");

    // Encode the reg_no parameter
    const encodedRegNo = encodeURIComponent(reg_no);

    try {
        // Make validation request using axios
        const response = await axios.get(`http://${decrypted_ip_port}/validation?key=${encodedRegNo}`);

        if (response.status === 200) {
            console.log('Validation successful');
            // Perform actions based on a successful validation

            // Continue with the app loading process
            continueLoading(decrypted_ip_port);
        } else {
            console.log('Validation failed:', response.status);
            // Quit the app if validation fails
            app.quit();
        }
    } catch (error) {
        console.error('Validation request failed:', error.message);
        // Quit the app on validation request error
        app.quit();
    }

    // Set the flag to indicate that the validation request has been sent
}

function continueLoading(proxyServer) {
    session.defaultSession.setProxy({ proxyRules: proxyServer });

    globalShortcut.register('CommandOrControl+Shift+Y', () => {
        // Your code for global shortcut
    });
}

app.on('before-quit', () => {
    globalShortcut.unregisterAll();
    console.log("App is quitting");
});
