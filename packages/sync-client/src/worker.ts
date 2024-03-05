export function useWorker(func: Function) {
  return new Promise((resolve, reject) => {
    // Convert the function to a string and wrap it in a worker
    const workerCode = `
            self.onmessage = function(e) {
                const result = (${func.toString()})();
                self.postMessage(result);
            };
        `;

    // Create a blob from the worker code
    const blob = new Blob([workerCode], { type: "application/javascript" });

    // Generate a URL for the blob
    const workerUrl = URL.createObjectURL(blob);

    // Create a new worker
    const worker = new Worker(workerUrl);

    // Handle the worker's response
    worker.onmessage = function (e) {
      resolve(e.data);
    };

    // Handle any errors from the worker
    worker.onerror = function (e) {
      reject(e.message);
    };

    // Start the worker
    worker.postMessage(null);
  });
}
