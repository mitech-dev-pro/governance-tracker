// Test script to validate the governance API
const testData = {
  number: "001",
  title: "Test",
  description: "Testing",
  status: "NOT_STARTED",
  ownerId: null,
  actionitem: "rebuild",
  departmentId: null,
  dueDate: null,
  clauseRefs: ["ISO27001 A.5.1"],
  progress: 0,
  tags: ["pilot", "draft"],
  visibility: "department",
};

async function testPost() {
  try {
    const response = await fetch("http://localhost:3000/api/governance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log("✅ POST request successful!");
      return result;
    } else {
      console.log("❌ POST request failed!");
      return null;
    }
  } catch (error) {
    console.error("Error testing API:", error);
    return null;
  }
}

async function testGet() {
  try {
    const response = await fetch("http://localhost:3000/api/governance");
    const result = await response.json();

    console.log("\n--- GET Request ---");
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log("✅ GET request successful!");
    } else {
      console.log("❌ GET request failed!");
    }
  } catch (error) {
    console.error("Error testing GET API:", error);
  }
}

// Run tests
async function runTests() {
  console.log("Testing Governance API...\n");

  console.log("--- POST Request ---");
  const createdItem = await testPost();

  // Wait a bit then test GET
  setTimeout(async () => {
    await testGet();
  }, 1000);
}

runTests();
