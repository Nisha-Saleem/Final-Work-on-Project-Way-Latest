import React, { useState, useCallback, useEffect } from 'react';
import { diagramApi } from '../api/DiagramApi';
import '../styles/diagram-editor-main.css';

// Import diagram editor components
import { SidebarLeft } from '../components/diagram/SidebarLeft';
import { SidebarRight } from '../components/diagram/SidebarRight';
import { Canvas } from '../components/diagram/Canvas';

const DiagramEditor = ({ userName }) => {
  const [shapes, setShapes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [currentDiagramId, setCurrentDiagramId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // History for Undo/Redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Helper to add state to history
  const addToHistory = (newShapes) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newShapes);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
  };

  // Load diagram on mount - check URL for diagramId first, then localStorage, then load by user
  useEffect(() => {
    const loadDiagram = async () => {
      // Get diagramId from URL query string
      const urlParams = new URLSearchParams(window.location.search);
      const diagramId = urlParams.get('diagramId');
      
      if (diagramId) {
        try {
          setIsLoading(true);
          const diagramRes = await diagramApi.getDiagram(diagramId);
const diagram = diagramRes.data;

if (diagram && (diagram.shapes || diagram.diagramData)) {
  if (diagram.shapes) {
    setShapes(diagram.shapes);
  } else if (diagram.diagramData?.nodes) {
    setShapes(diagram.diagramData.nodes);
  }
  setCurrentDiagramId(diagramId);
  addToHistory(diagram.shapes || diagram.diagramData?.nodes || []);
}
        } catch (error) {
          console.error("Failed to load diagram:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // If no diagramId in URL, try loading diagram for this specific user
        try {
          if (userName) {
            const userDiagrams = await diagramApi.getAllDiagrams(userName);
            if (userDiagrams.data && userDiagrams.data.length > 0) {
              // Find the most recent diagram for this user
              const userDiagram = userDiagrams.data[0];
              if (userDiagram) {
                if (userDiagram.shapes) {
                  setShapes(userDiagram.shapes);
                } else if (userDiagram.diagramData?.nodes) {
                  setShapes(userDiagram.diagramData.nodes);
                }
                setCurrentDiagramId(userDiagram._id);
                addToHistory(userDiagram.shapes || userDiagram.diagramData?.nodes || []);
                // Update URL with diagramId
                const newUrl = `${window.location.pathname}?diagramId=${userDiagram._id}`;
                window.history.replaceState({}, "", newUrl);
              }
            }
          }
          // If no diagram found for user, try loading from localStorage as fallback
          const savedData = localStorage.getItem(`diagramEditorData_${userName}`);
          if (savedData && !currentDiagramId) {
            const parsedShapes = JSON.parse(savedData);
            setShapes(parsedShapes);
            addToHistory(parsedShapes);
          }
        } catch (error) {
          console.error("Failed to load diagram for user:", error);
          // Fallback to localStorage
          try {
            const savedData = localStorage.getItem(`diagramEditorData_${userName}`);
            if (savedData) {
              const parsedShapes = JSON.parse(savedData);
              setShapes(parsedShapes);
              addToHistory(parsedShapes);
            }
          } catch (localError) {
            console.error("Failed to load from localStorage:", localError);
          }
        }
      }
    };
    
    loadDiagram();
  }, [userName]);
    
  // Listen for save diagram event
  useEffect(() => {
      const handleSaveEvent = () => {
          saveDiagram();
      };
      
      window.addEventListener('saveDiagram', handleSaveEvent);
      
      return () => {
          window.removeEventListener('saveDiagram', handleSaveEvent);
      };
  }, [shapes]);

  const handleAddShape = (shape) => {
    const newShapes = [...shapes, shape];
    setShapes(newShapes);
    addToHistory(newShapes);
  };

  const handleDragStart = (shape) => {
    // Handle drag start logic
    console.log('Dragging shape:', shape);
  };

  const handleUpdateShape = useCallback((id, updates) => {
    setShapes(prev => {
        const next = prev.map(s => s.id === id ? { ...s, ...updates } : s);
        return next;
    });
  }, []);

  // Save to history only on selection change or mouse up (debouncing for drag)
  // For simplicity in this demo, we update history explicitly in SidebarRight or when adding
  // Real app would debounce history updates for dragging properties
  const handleCommitUpdate = (updates) => {
      if (!selectedId) return;
      const newShapes = shapes.map(s => s.id === selectedId ? { ...s, ...updates } : s);
      setShapes(newShapes);
      addToHistory(newShapes);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const newShapes = shapes.filter(s => s.id !== selectedId);
    setShapes(newShapes);
    setSelectedId(null);
    addToHistory(newShapes);
  };

  const handleDuplicate = () => {
      if (!selectedId) return;
      const original = shapes.find(s => s.id === selectedId);
      if (!original) return;
      
      const newShape = {
          ...original,
          id: Date.now().toString(),
          x: original.x + 20,
          y: original.y + 20
      };
      
      const newShapes = [...shapes, newShape];
      setShapes(newShapes);
      setSelectedId(newShape.id);
      addToHistory(newShapes);
  };

  const undo = () => {
      if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setShapes(history[newIndex]);
      }
  };

  const redo = () => {
      if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setShapes(history[newIndex]);
      }
  };

 const saveDiagram = async () => {
  try {
    // Ye wahi structure hai jo backend expect karta hai
    const body = {
      studentId: userName,          // Use logged-in user's name for per-user isolation
      projectId: userName,         // Use userName as projectId for per-user isolation
      title: `Diagram ${new Date().toLocaleString()}`,
      description: "Saved from React app",
      diagramData: {
        // yahan tumhare shapes ko diagramData me daal rahe hain
        nodes: shapes,               // agar tum nodes/edges alag rakhogi to adjust kar lena
        edges: [],
      },
      shapes: shapes,                // extra field, tumhari schema me allowed hai
    };

    console.log("BODY SENDING TO BACKEND:", body);

    let response;
    if (currentDiagramId) {
      // Update existing diagram by id
      response = await diagramApi.updateDiagram(currentDiagramId, body);
    } else {
      // Create new diagram
      response = await diagramApi.saveDiagram(body);
      // diagramApi.saveDiagram currently returns response.data
      const saved = response.data || response; // safety

      // Controller ka response aisa hai: { success, message, data: diagram }
      const id = saved.data?._id || saved._id;
      if (id) {
        setCurrentDiagramId(id);
        const newUrl = `${window.location.pathname}?diagramId=${id}`;
        window.history.replaceState({}, "", newUrl);
      }
    }

    localStorage.setItem(`diagramEditorData_${userName}`, JSON.stringify(shapes));
    alert("Diagram saved successfully to backend!");
  } catch (error) {
    console.error("Failed to save diagram to backend:", error);
    localStorage.setItem(`diagramEditorData_${userName}`, JSON.stringify(shapes));
    alert("Failed to save to backend, saved locally instead.");
  }
};

  const newDiagram = () => {
      if (confirm('Are you sure you want to create a new diagram? Unsaved changes will be lost.')) {
          setShapes([]);
          setSelectedId(null);
          setCurrentDiagramId(null);
          localStorage.removeItem(`diagramEditorData_${userName}`);
          addToHistory([]);
          // Clear URL query string
          window.history.replaceState({}, '', window.location.pathname);
      }
  };

  const selectedShape = shapes.find(s => s.id === selectedId) || null;

  return (
    <div className="diagram-editor-container">
      {/* HEADER */}
      <header className="diagram-editor-header">
        <div className="diagram-editor-logo">
          <svg className="diagram-editor-logo-svg" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z"></path>
            <path clipRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00004 12.2612 8 12.2667 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z" fillRule="evenodd"></path>
          </svg>
          <h2 className="diagram-editor-title">Diagram Pro</h2>
        </div>
        <div className="diagram-editor-controls">
          <button onClick={newDiagram} className="diagram-editor-control-button">
            <span className="material-symbols-outlined diagram-editor-control-icon">add</span>
          </button>
          <button onClick={saveDiagram} disabled={isLoading} className="diagram-editor-control-button" title="Save to Backend">
            <span className="material-symbols-outlined diagram-editor-control-icon">save</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="diagram-editor-main">
        <SidebarLeft onDragStart={handleDragStart} />
        <Canvas 
            shapes={shapes}
            onAddShape={handleAddShape}
            onSelectShape={setSelectedId}
            onUpdateShape={handleUpdateShape}
            selectedId={selectedId}
            zoom={zoom}
        />
        <SidebarRight 
            selectedShape={selectedShape} 
            onUpdateShape={handleCommitUpdate}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
        />
      </main>

      {/* FOOTER */}
      <footer className="diagram-editor-footer">
        <div className="diagram-editor-footer-text">
          Diagram Editor Pro - Professional UML & Flowchart Tool
        </div>
        <div className="diagram-editor-footer-controls">
          <button onClick={undo} disabled={historyIndex <= 0} className="diagram-editor-footer-button"><span className="material-symbols-outlined diagram-editor-footer-icon">undo</span></button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="diagram-editor-footer-button"><span className="material-symbols-outlined diagram-editor-footer-icon">redo</span></button>
          <button onClick={handleDelete} disabled={!selectedId} className="diagram-editor-footer-button delete"><span className="material-symbols-outlined diagram-editor-footer-icon">delete</span></button>
        </div>
      </footer>
    </div>
  );
};

export default DiagramEditor;
