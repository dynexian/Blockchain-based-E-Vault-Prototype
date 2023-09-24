// Connect to MetaMask
let account;

const connectMetamask = async () => {
    if (window.ethereum !== undefined) {
        try {
            await ethereum.request({ method: "eth_requestAccounts" });
            const accounts = await ethereum.request({ method: "eth_accounts" });
            account = accounts[0];
            document.getElementById("accountArea").innerHTML = `Connected Account: ${account}`;
            logMessage("MetaMask connected.");
        } catch (error) {
            console.log(error);
            logMessage("MetaMask connection failed.");
        }
    }
}

// Connect to the smart contract
const connectContract = async () => {
    // Define your contract ABI and address here
    const ABI = [
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_title",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_content",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_documentHash",
                    "type": "string"
                }
            ],
            "name": "createLegalRecord",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "title",
                    "type": "string"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "RecordCreated",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_id",
                    "type": "uint256"
                }
            ],
            "name": "getLegalRecord",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "recordCount",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "records",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "title",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "content",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "documentHash",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];
    const Address = "0x7284e5e1AE35A02348282c823Cc76350F9320531"; // Your contract address
    
    window.web3 = await new Web3(window.ethereum);
    window.contract = await new window.web3.eth.Contract(ABI, Address);
    document.getElementById("contractArea").innerHTML = "Connected to Smart Contract";
    logMessage("Connected to contract.");
}

// Function to calculate the hash of a file
async function calculateHash() {
    const fileInput = document.getElementById("fileInput");
    const hashArea = document.getElementById("hashArea");

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];

        // Read the file as an ArrayBuffer
        const buffer = await file.arrayBuffer();

        // Calculate the SHA-256 hash
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");

        return hashHex; // Return the hash value
    } else {
        hashArea.textContent = "No file selected.";
        return null; // Return null if no file is selected
    }
}

// Create a legal record with document hash
const createLegalRecord = async () => {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const fileInput = document.getElementById("fileInput");
    const createRecordArea = document.getElementById("createRecordArea");
    const CreateTableContainer = document.getElementById("CreateTableContainer"); // New container for the table wrapper

    try {
        // Check if MetaMask is installed and connected
        if (typeof window.ethereum !== "undefined") {
            const accounts = await ethereum.request({ method: "eth_accounts" });
            if (accounts.length === 0) {
                throw new Error("No Ethereum accounts are available.");
            }

            const account = accounts[0];
            const documentFile = fileInput.files[0];

            // Calculate the hash of the uploaded document
            const documentHash = await calculateHash();

            if (documentHash) {
                // Hashed successfully
                createRecordArea.innerHTML = '<span style="color: green; font-weight: bold;">Document Hashed Successfully</span>';
                createRecordArea.innerHTML += `Document Hash: ${documentHash}<br>`;

                // Send the hash to the smart contract
                const transaction = await window.contract.methods.createLegalRecord(title, content, documentHash).send({ from: account });

                // Wait for the transaction to be mined
                

                logMessage("Transaction successful for creating a legal record.");

                // Display transaction details in a table
                const transactionDetails = `
                    <table border="1">
                        <tr>
                            <th>Transaction Hash</th>
                            <th>Block Hash</th>
                            <th>Block Number</th>
                        </tr>
                        <tr>
                            <td>${transaction.transactionHash}</td>
                            <td>${transaction.blockHash}</td>
                            <td>${transaction.blockNumber}</td>
                        </tr>
                    </table>
                `;

                // Create a div to wrap the transaction details table
                const tableWrapper = document.createElement("div");
                tableWrapper.classList.add("table-wrapper");
                tableWrapper.innerHTML = transactionDetails;

                // Clear the previous content in the CreateTableContainer
                CreateTableContainer.innerHTML = "";

                // Append the table wrapper to the container
                CreateTableContainer.appendChild(tableWrapper);
            } else {
                // Hashing failed
                createRecordArea.innerHTML = `Hashing failed. Please try again.`;
                logMessage("Hashing failed.");
            }
        } else {
            logMessage("MetaMask is not installed or connected.");
        }
    } catch (error) {
        console.error(error);
        logMessage("Error creating a legal record. See the console for details.");
    }
};
const getLegalRecord = async () => {
    const recordId = document.getElementById("recordId").value;
    const getRecordArea = document.getElementById("getRecordArea");
    const GetTableContainer = document.getElementById("GetTableContainer"); // New container for the table wrapper
    const downloadLinkContainer = document.createElement("div"); // Container for the download link

    if (typeof window.contract !== "undefined") {
        try {
            const data = await window.contract.methods.getLegalRecord(recordId).call();

            if (data[0] !== "0") {
                // Create and populate the table
                const tableHTML = `
                    <table border="1">
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Content</th>
                            <th>Owner</th>
                            <th>Document Hash</th>
                        </tr>
                        <tr>
                            <td>${data[0]}</td>
                            <td>${data[1]}</td>
                            <td>${data[2]}</td>
                            <td>${data[3]}</td>
                            <td>${data[4]}</td>
                        </tr>
                    </table>
                `;

                // Create a div to wrap the table
                const tableWrapper = document.createElement("div");
                tableWrapper.classList.add("table-wrapper");
                tableWrapper.innerHTML = tableHTML;

                // Clear the previous content in the GetTableContainer
                GetTableContainer.innerHTML = "";

                // Append the table wrapper to the container
                GetTableContainer.appendChild(tableWrapper);

                // Create the download link
                const downloadLink = document.createElement("a");
                downloadLink.href = `download.php?id=${data[0]}`;
                downloadLink.textContent = "Download Document"; // You can customize the link text here

                // Append the download link to the downloadLinkContainer
                downloadLinkContainer.appendChild(downloadLink);

                // Show the download link container
                downloadLinkContainer.style.display = "block";

                logMessage("Legal record fetched successfully.");
            } else {
                // No valid record found
                GetTableContainer.innerHTML = ""; // Clear the container
                getRecordArea.innerHTML = "No valid record found.";
                downloadLinkContainer.innerHTML = ""; // Clear the download link container
                downloadLinkContainer.style.display = "none"; // Hide the download link container
                logMessage("No valid record found.");
            }

            // Append the download link container to the GetTableContainer
            GetTableContainer.appendChild(downloadLinkContainer);

        } catch (error) {
            console.error(error);
            logMessage("Error fetching a legal record.");
        }
    }
};





const displayAllRecords = async () => {
    if (typeof window.ethereum !== "undefined") {
        try {
            const recordCount = await window.contract.methods.recordCount().call();
            const GetAllTableContainer = document.getElementById("GetAllTableContainer"); // New container for the table wrapper
            let allRecords = "<table border='1'><tr><th>ID</th><th>Title</th><th>Content</th><th>Owner</th><th>Download</th></tr>";

            for (let i = 1; i <= recordCount; i++) {
                const data = await window.contract.methods.records(i).call();
                allRecords += `<tr><td>${data[0]}</td><td>${data[1]}</td><td>${data[2]}</td><td>${data[3]}</td>`;
                allRecords += `<td><a href="download.php?id=${data[0]}" download>Download</a></td></tr>`;
            }

            allRecords += "</table>";

            // Create a div to wrap the allRecords table
            const tableWrapper = document.createElement("div");
            tableWrapper.classList.add("table-wrapper");
            tableWrapper.innerHTML = allRecords;

            // Clear the previous content in the GetAllTableContainer
            GetAllTableContainer.innerHTML = "";

            // Append the table wrapper to the container
            GetAllTableContainer.appendChild(tableWrapper);

            logMessage("All records fetched successfully.");
        } catch (error) {
            console.error(error);
            logMessage("Error fetching all records.");
        }
    }
};


// Function to log messages in the log area
function logMessage(message) {
    const logArea = document.getElementById("logArea");
    const logEntry = document.createElement("p");
    logEntry.textContent = message;
    logArea.appendChild(logEntry);
}

// Event listeners
document.getElementById("connectMetamask").addEventListener("click", connectMetamask);
document.getElementById("connectContract").addEventListener("click", connectContract);
document.getElementById("createLegalRecord").addEventListener("click", createLegalRecord);
document.getElementById("getLegalRecord").addEventListener("click", getLegalRecord);
document.getElementById("getAllRecords").addEventListener("click", displayAllRecords);
