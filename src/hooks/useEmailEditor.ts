import { useRef, useState, useEffect } from "react";
import { type EditorRef } from "react-email-editor";
import type { SavedTemplate, MergeTag, UnlayerFile, UnlayerAPI } from "../types/email-editor";

export const useEmailEditor = () => {
  const editorRef = useRef<EditorRef>(null);
  const [fromEmail, setFromEmail] = useState("from@gmail.com");
  const [testEmails, setTestEmails] = useState("to@gmail.com");
  const [isLoading, setIsLoading] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [mergeTags, setMergeTags] = useState<MergeTag[]>([
    { name: "first_name", value: "John", sample: "John" },
    { name: "last_name", value: "Doe", sample: "Doe" },
    { name: "company_name", value: "Your Company", sample: "Your Company" },
    { name: "user_email", value: "user@example.com", sample: "user@example.com" },
    { name: "unsubscribe_link", value: "https://example.com/unsubscribe", sample: "Unsubscribe" },
  ]);

  // Load saved templates from localStorage on component mount
  useEffect(() => {
    loadSavedTemplates();
    loadSavedMergeTags();
  }, []);

  const loadSavedTemplates = () => {
    const saved = localStorage.getItem("saved_email_templates");
    if (saved) {
      try {
        const templates = JSON.parse(saved);
        setSavedTemplates(templates);
      } catch (error) {
        console.error("Error loading saved templates:", error);
      }
    }
  };

  const loadSavedMergeTags = () => {
    const saved = localStorage.getItem("unlayer_merge_tags");
    if (saved) {
      try {
        const tags = JSON.parse(saved);
        setMergeTags(tags);
      } catch (error) {
        console.error("Error loading saved merge tags:", error);
      }
    }
  };

  const saveTemplatesToStorage = (templates: SavedTemplate[]) => {
    localStorage.setItem("saved_email_templates", JSON.stringify(templates));
    setSavedTemplates(templates);
  };

  // Convert image URL to base64
  const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
    try {
      if (imageUrl.startsWith('data:image/')) {
        return imageUrl;
      }

      if (imageUrl.startsWith('blob:')) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return imageUrl;
    }
  };

  // Recursively find and convert all images in design JSON to base64
  const convertDesignImagesToBase64 = async (design: Record<string, unknown>): Promise<{ design: Record<string, unknown>, base64Images: Record<string, string> }> => {
    const base64Images: Record<string, string> = {};
    
    const processObject = async (obj: unknown): Promise<unknown> => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        const processedArray = [];
        for (const item of obj) {
          processedArray.push(await processObject(item));
        }
        return processedArray;
      }

      const processedObj: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        if (key === 'src' && typeof value === 'string' && value.includes('http')) {
          // Convert image URL to base64
          const base64 = await convertImageToBase64(value);
          base64Images[value] = base64;
          processedObj[key] = base64;
        } else if (key === 'url' && typeof value === 'string' && value.includes('http') && value.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          // Handle background images or other URL fields that contain images
          const base64 = await convertImageToBase64(value);
          base64Images[value] = base64;
          processedObj[key] = base64;
        } else if (key === 'backgroundImage' && typeof value === 'string' && value.includes('http')) {
          // Handle CSS background images
          const base64 = await convertImageToBase64(value);
          base64Images[value] = base64;
          processedObj[key] = base64;
        } else if (typeof value === 'object') {
          processedObj[key] = await processObject(value);
        } else {
          processedObj[key] = value;
        }
      }
      return processedObj;
    };

    const processedDesign = await processObject(design) as Record<string, unknown>;
    return { design: processedDesign, base64Images };
  };

  // Convert images to base64 in HTML - Enhanced version
  const convertImagesToBase64 = async (html: string): Promise<string> => {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const conversionPromises: Promise<void>[] = [];

      // Convert <img> tags
      const imgTags = tempDiv.querySelectorAll('img');
      imgTags.forEach((img) => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('data:image/')) {
          const promise = convertImageToBase64(src).then(base64Src => {
            img.setAttribute('src', base64Src);
          });
          conversionPromises.push(promise);
        }
      });

      // Convert CSS background images
      const allElements = tempDiv.querySelectorAll('*');
      allElements.forEach((element) => {
        const style = element.getAttribute('style');
        if (style && style.includes('background-image')) {
          const urlMatch = style.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/i);
          if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith('data:image/')) {
            const promise = convertImageToBase64(urlMatch[1]).then(base64Src => {
              const newStyle = style.replace(
                /background-image:\s*url\(['"]?[^'"]+['"]?\)/i,
                `background-image: url('${base64Src}')`
              );
              element.setAttribute('style', newStyle);
            });
            conversionPromises.push(promise);
          }
        }
      });

      // Convert data attributes that might contain image URLs
      allElements.forEach((element) => {
        const dataSrc = element.getAttribute('data-src');
        if (dataSrc && !dataSrc.startsWith('data:image/')) {
          const promise = convertImageToBase64(dataSrc).then(base64Src => {
            element.setAttribute('data-src', base64Src);
          });
          conversionPromises.push(promise);
        }
      });

      await Promise.all(conversionPromises);
      return tempDiv.innerHTML;
    } catch (error) {
      console.error('Error converting images to base64:', error);
      return html;
    }
  };

  const handleSendTest = async () => {
    const editor = editorRef.current?.editor;
    if (!editor) {
      console.error("Editor not found");
      return;
    }

    if (!fromEmail || !testEmails) {
      alert("Please fill in both From and To email addresses");
      return;
    }

    setIsLoading(true);
    console.log("Starting HTML export for test email...");

    editor.exportHtml(async (data) => {
      console.log("Export HTML callback received data:", data);
      
      const html = data.html;
      const design = data.design;

      console.log("Raw HTML from export:", html);
      console.log("Design JSON from export:", design);

      if (!html) {
        console.error("No HTML received from export");
        alert("Failed to export HTML. Please try again.");
        setIsLoading(false);
        return;
      }

      console.log("Starting image conversion to base64...");

      // First, convert images in the design JSON to base64
      const { design: processedDesign, base64Images } = await convertDesignImagesToBase64(design);
      console.log("Design images converted to base64:", Object.keys(base64Images).length, "images");

      // Then, convert images in the HTML to base64
      const htmlWithBase64Images = await convertImagesToBase64(html);
      console.log("HTML images converted to base64");

      console.log("Sending test email:");
      console.log("From:", fromEmail);
      console.log("To:", testEmails);
      console.log("HTML with base64 images:", htmlWithBase64Images);
      console.log("HTML length:", htmlWithBase64Images.length);

      // Also log a preview of the HTML (first 500 characters)
      console.log("HTML preview:", htmlWithBase64Images.substring(0, 500) + "...");

      // Check if there are any remaining S3 URLs in the HTML
      const s3UrlPattern = /https:\/\/[^"]*\.amazonaws\.com[^"]*/g;
      const remainingS3Urls = htmlWithBase64Images.match(s3UrlPattern);
      if (remainingS3Urls && remainingS3Urls.length > 0) {
        console.warn("Warning: Some S3 URLs still remain in the HTML:", remainingS3Urls);
      } else {
        console.log("✅ All images successfully converted to base64 - no S3 URLs remaining");
      }

      try {
        const response = await fetch("/api/send-test-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: testEmails.split(",").map((email) => email.trim()),
            html: htmlWithBase64Images, // Send HTML with base64 images
            subject: "Test Email from Email Editor",
            mergeTags: mergeTags.map(tag => ({
              name: tag.name,
              placeholder: `{{${tag.name}}}`,
              sampleValue: tag.value
            })),
            design: processedDesign // Send processed design with base64 images
          }),
        });

        if (response.ok) {
          alert("Test email sent successfully with base64 images!");
        } else {
          alert("Failed to send test email. Please check your API endpoint.");
        }
      } catch (error) {
        console.error("Error sending test email:", error);
        alert(
          "Error sending test email. Make sure your API endpoint is set up."
        );
      } finally {
        setIsLoading(false);
      }
    }, {
      // Export options to ensure we get proper HTML
      cleanup: true,
      minify: false, // Keep readable for debugging
    });
  };

  const handleSaveTemplate = async () => {
    const editor = editorRef.current?.editor;
    if (!editor) return;

    const name = templateName.trim() || `Template ${Date.now()}`;

    editor.saveDesign(async (design: Record<string, unknown>) => {
      console.log("Original design before base64 conversion:", design);
      
      // Convert all images in the design to base64
      const { design: processedDesign, base64Images } = await convertDesignImagesToBase64(design);
      
      console.log("Processed design with base64 images:", processedDesign);
      console.log("Base64 images mapping:", base64Images);

      const newTemplate: SavedTemplate = {
        id: currentTemplateId || `template_${Date.now()}`,
        name: name,
        design: processedDesign, // Save design with base64 images
        createdAt: new Date().toISOString(),
        base64Images: base64Images, // Store the mapping for reference
      };

      let updatedTemplates;
      if (currentTemplateId) {
        // Update existing template
        updatedTemplates = savedTemplates.map((template) =>
          template.id === currentTemplateId ? newTemplate : template
        );
      } else {
        // Add new template
        updatedTemplates = [...savedTemplates, newTemplate];
      }

      saveTemplatesToStorage(updatedTemplates);
      setTemplateName("");
      setCurrentTemplateId(null);
      alert(`Template "${name}" saved successfully with base64 images!`);
    });
  };

  const handleLoadTemplate = (template: SavedTemplate) => {
    const editor = editorRef.current?.editor;
    if (!editor) return;

    console.log("Loading template with base64 images:", template);
    
    
    editor.loadDesign(template.design as any);
    setCurrentTemplateId(template.id);
    setTemplateName(template.name);
    setShowTemplateManager(false);
    
    console.log("Template loaded successfully with base64 images");
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      const updatedTemplates = savedTemplates.filter(
        (t) => t.id !== templateId
      );
      saveTemplatesToStorage(updatedTemplates);

      // If we're currently editing the deleted template, reset
      if (currentTemplateId === templateId) {
        setCurrentTemplateId(null);
        setTemplateName("");
      }
    }
  };

  const handleNewTemplate = () => {
    const editor = editorRef.current?.editor;
    if (!editor) return;

    if (confirm("Create a new template? Any unsaved changes will be lost.")) {
      editor.loadBlank();
      setCurrentTemplateId(null);
      setTemplateName("");
      setShowTemplateManager(false);
    }
  };

  const handleDuplicateTemplate = (template: SavedTemplate) => {
    const newTemplate: SavedTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
    };

    const updatedTemplates = [...savedTemplates, newTemplate];
    saveTemplatesToStorage(updatedTemplates);
  };

  // Enhanced editor load handler with version 1.157.0
  const handleEditorLoad = () => {
    console.log('Editor loaded, attempting to register image callback...');
    
    // With version 1.157.0, the unlayer object should be available directly
    const unlayer = window.unlayer;
    
    if (unlayer) {
      console.log('Found unlayer object, registering image callback...');
      registerImageCallback(unlayer);
    } else {
      console.error('Unlayer object not found. Trying alternative approach...');
      // Try to access it through the editor ref
      const editor = editorRef.current?.editor;
      if (editor && (editor as unknown as Record<string, unknown>).unlayer) {
        const editorUnlayer = (editor as unknown as Record<string, unknown>).unlayer as UnlayerAPI;
        console.log('Found unlayer through editor ref');
        registerImageCallback(editorUnlayer);
      } else {
        console.error('Could not find unlayer object. Image upload callback may not work.');
        // Set a timeout to try again later
        setTimeout(() => {
          const retryUnlayer = window.unlayer;
          if (retryUnlayer) {
            console.log('Found unlayer on retry');
            registerImageCallback(retryUnlayer);
          }
        }, 2000);
      }
    }
  };

  const registerImageCallback = (unlayer: UnlayerAPI) => {
    try {
      console.log('Registering image upload callback...');
      
      // Intercept image uploads and convert to base64 immediately
      unlayer.registerCallback('image', (file: UnlayerFile, done: (result: { progress: number; url: string }) => void) => {
        console.log('Image upload intercepted:', file);
        
        if (!file || !file.attachments || !file.attachments[0]) {
          console.error("No file found in attachments:", file);
          done({ progress: 100, url: "" });
          return;
        }
        
        const imageFile = file.attachments[0];
        console.log('Processing file:', imageFile.name, imageFile.type, imageFile.size);
        
        // Validate file type
        if (!imageFile.type.startsWith('image/')) {
          console.error('File is not an image:', imageFile.type);
          done({ progress: 100, url: "" });
          return;
        }
        
        const reader = new FileReader();
        reader.onload = () => {
          const base64Result = reader.result as string;
          console.log('Base64 conversion successful, length:', base64Result.length);
          console.log('Base64 preview:', base64Result.substring(0, 100) + '...');
          
          // Return base64 as data URL (which is a valid URL format)
          done({ progress: 100, url: base64Result });
        };
        reader.onerror = (error) => {
          console.error("Failed to read file:", error);
          done({ progress: 100, url: "" });
        };
        reader.readAsDataURL(imageFile);
      });

      console.log('Image upload callback registered successfully');
      
      // Optional: Intercept file manager if you're using it
      unlayer.registerCallback('selectImage', (data: { url: string }, done: (result: { url: string }) => void) => {
        console.log('Image selection intercepted:', data);
        // Handle image selection from file manager
        // Convert to base64 if needed
        done({ url: data.url });
      });
      
    } catch (error) {
      console.error('Error registering image callback:', error);
    }
  };

  // Export HTML with base64 images (standalone function)
  const exportHtmlWithBase64 = async (): Promise<{ html: string; design: Record<string, unknown> } | null> => {
    const editor = editorRef.current?.editor;
    if (!editor) {
      console.error("Editor not found");
      return null;
    }

    return new Promise((resolve) => {
      editor.exportHtml(async (data) => {
        console.log("Export HTML callback received data:", data);
        
        const html = data.html;
        const design = data.design;

        if (!html) {
          console.error("No HTML received from export");
          resolve(null);
          return;
        }

        console.log("Starting image conversion to base64 for export...");

        // First, convert images in the design JSON to base64
        const { design: processedDesign, base64Images } = await convertDesignImagesToBase64(design);
        console.log("Design images converted to base64:", Object.keys(base64Images).length, "images");

        // Then, convert images in the HTML to base64
        const htmlWithBase64Images = await convertImagesToBase64(html);
        console.log("HTML images converted to base64");

        // Check if there are any remaining S3 URLs in the HTML
        const s3UrlPattern = /https:\/\/[^"]*\.amazonaws\.com[^"]*/g;
        const remainingS3Urls = htmlWithBase64Images.match(s3UrlPattern);
        if (remainingS3Urls && remainingS3Urls.length > 0) {
          console.warn("Warning: Some S3 URLs still remain in the HTML:", remainingS3Urls);
        } else {
          console.log("✅ All images successfully converted to base64 - no S3 URLs remaining");
        }

        console.log("Final HTML with base64 images:", htmlWithBase64Images);
        console.log("HTML length:", htmlWithBase64Images.length);

        resolve({
          html: htmlWithBase64Images,
          design: processedDesign
        });
      }, {
        cleanup: true,
        minify: false,
      });
    });
  };

  return {
    // Refs
    editorRef,
    
    // State
    fromEmail,
    setFromEmail,
    testEmails,
    setTestEmails,
    isLoading,
    savedTemplates,
    showTemplateManager,
    setShowTemplateManager,
    templateName,
    setTemplateName,
    currentTemplateId,
    mergeTags,
    
    // Actions
    handleSendTest,
    handleSaveTemplate,
    handleLoadTemplate,
    handleDeleteTemplate,
    handleNewTemplate,
    handleDuplicateTemplate,
    handleEditorLoad,
    exportHtmlWithBase64,
  };
}; 