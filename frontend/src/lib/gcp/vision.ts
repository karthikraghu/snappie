import { ImageAnnotatorClient } from '@google-cloud/vision';

// Instantiates a client
const client = new ImageAnnotatorClient();

export const GCPVision = {
  /**
   * Analyzes an image on Cloud Storage using Vision API label detection.
   * Note: The vision API can take a `gs://` URI string directly! Very efficient.
   */
  detectObject: async (gcsUri: string) => {
    const [result] = await client.labelDetection(gcsUri);
    const labels = result.labelAnnotations || [];
    
    // Convert to a simple string array (sorted by confidence naturally)
    const labelNames = labels.map(label => label.description || "");

    // Choose the most defining object (e.g. the first valid noun)
    const primaryObject = labelNames.length > 0 ? labelNames[0] : "Mystery Object";

    return {
      object: primaryObject,
      labels: labelNames
    };
  }
};
