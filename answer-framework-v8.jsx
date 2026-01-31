import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ChevronRight, ChevronUp, ChevronDown, X, Copy, Check, MessageSquare, Lightbulb, ArrowLeft, Send, HelpCircle, GripVertical, Plus, CheckCircle2, Pause, Minimize2, Maximize2, Clock } from 'lucide-react';

export default function AnswerFrameworkPrototype() {
  const [showEnginePanel, setShowEnginePanel] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [panelPosition, setPanelPosition] = useState('left');
  const [activeConsideration, setActiveConsideration] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [showAIReference, setShowAIReference] = useState(false);
  const [snippets, setSnippets] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [copiedPhrase, setCopiedPhrase] = useState(null);
  const [directInput, setDirectInput] = useState('');
  const [awaitingClarification, setAwaitingClarification] = useState(false);
  const [pendingUserMessage, setPendingUserMessage] = useState('');
  
  // Drag state
  const [draggingSnippet, setDraggingSnippet] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isOverDropZone, setIsOverDropZone] = useState(false);
  const dropZoneRef = useRef(null);
  const chatInputRef = useRef(null);

  // Response builder state
  const [selectedIdeaIndexes, setSelectedIdeaIndexes] = useState([]);
  const [editingIdeaIndex, setEditingIdeaIndex] = useState(null);
  const [editedIdeaText, setEditedIdeaText] = useState('');
  const [editedIdeas, setEditedIdeas] = useState({}); // stores edited versions by index
  const [regeneratePrompt, setRegeneratePrompt] = useState('');
  const [showRegenerateOptions, setShowRegenerateOptions] = useState(false);
  const [hasSeenResponseBuilderIntro, setHasSeenResponseBuilderIntro] = useState(false);
  const [isBuildingAnswer, setIsBuildingAnswer] = useState(false);
  const [showContextWindow, setShowContextWindow] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [isLoadingConsiderations, setIsLoadingConsiderations] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [focusChips, setFocusChips] = useState([]);

  // Version history state
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(4);
  const [previewingVersion, setPreviewingVersion] = useState(null);
  const versionDropdownRef = useRef(null);

  // Refine with AI state
  const [isRefining, setIsRefining] = useState(false);
  const [isReviewingChanges, setIsReviewingChanges] = useState(false);
  const [refinedContent, setRefinedContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [showDiff, setShowDiff] = useState(false);

  // Auto-save indicator state
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'editing' | 'saved'
  const saveTimeoutRef = useRef(null);

  // Auto-save effect - shows "Saved" after user stops typing
  useEffect(() => {
    if (!directInput.trim()) {
      setSaveStatus('idle');
      return;
    }

    // When content changes, mark as editing
    setSaveStatus('editing');

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // After 2 seconds of no changes, mark as saved
    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saved');

      // Hide the "Saved" indicator after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [directInput]);

  const versions = {
    1: {
      label: 'Empty',
      badge: { text: '○ Empty', bgColor: 'bg-gray-100', textColor: 'text-gray-500' },
      content: '',
      color: 'gray'
    },
    2: {
      label: 'AI draft',
      badge: { text: '✨ AI Draft', bgColor: 'bg-teal-50', textColor: 'text-teal-700' },
      content: 'Retrofitting existing doors with the Assa Abloy system is generally feasible for most standard commercial door frames. Key considerations include door thickness (minimum 1.75"), existing cutout compatibility, and power supply routing. The wireless models (Aperio series) offer easier installation without door modifications.',
      color: 'teal'
    },
    3: {
      label: 'Your edit',
      badge: { text: '✎ Your Edit', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
      content: 'Retrofitting doors with Assa Abloy is feasible for most commercial frames. Requirements: door thickness ≥1.75", compatible cutouts, power routing. I recommend the Aperio wireless series. NOTE: Verify frame compatibility during site survey next week.',
      color: 'amber'
    },
    4: {
      label: 'Refined',
      badge: { text: '✓ Refined', bgColor: 'bg-green-50', textColor: 'text-green-700' },
      content: 'Retrofitting doors with the Assa Abloy system is feasible for most commercial door frames. Key requirements: door thickness ≥1.75", compatible cutouts, and proper power routing. The Aperio wireless series is recommended for easier installation. Action item: Verify frame compatibility during the site survey next week.',
      color: 'green'
    }
  };

  // Close version dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (versionDropdownRef.current && !versionDropdownRef.current.contains(e.target)) {
        setShowVersionDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectVersion = (num) => {
    const version = versions[num];
    if (num === currentVersion) {
      setPreviewingVersion(null);
    } else {
      setPreviewingVersion(num);
    }
    setDirectInput(version.content);
    setShowVersionDropdown(false);
  };

  const restoreVersion = () => {
    if (!previewingVersion) return;
    setCurrentVersion(previewingVersion);
    setPreviewingVersion(null);
  };

  const cancelPreview = () => {
    setPreviewingVersion(null);
    setDirectInput(versions[currentVersion].content);
  };

  // Refine with AI handlers
  const handleRefineWithAI = () => {
    if (!directInput.trim()) return;

    // Store original content and start refining
    setOriginalContent(directInput);
    setIsRefining(true);
    setShowDiff(false);

    // Simulate AI refinement (2 seconds)
    setTimeout(() => {
      // Generate refined content (in real app, this would be an API call)
      const refined = `Retrofitting doors with the Assa Abloy system is feasible for most commercial door frames. **Key requirements:** door thickness ≥1.75", compatible cutouts, and proper power routing. The Aperio wireless series is recommended for easier installation. **Action item:** Verify frame compatibility during the site survey next week.`;

      setRefinedContent(refined);
      setIsRefining(false);
      setIsReviewingChanges(true);
    }, 2000);
  };

  const handleDiscardChanges = () => {
    setIsReviewingChanges(false);
    setRefinedContent('');
    setShowDiff(false);
    // Keep original content in directInput
  };

  const handleAcceptAndEdit = () => {
    setDirectInput(refinedContent);
    setIsReviewingChanges(false);
    setRefinedContent('');
    setShowDiff(false);
  };

  const handleAcceptAndSubmit = () => {
    setDirectInput(refinedContent);
    setIsReviewingChanges(false);
    setRefinedContent('');
    setShowDiff(false);
    // In real app, would trigger submit
  };

  // Panel drag and resize state
  const [panelBounds, setPanelBounds] = useState({
    x: null, // null means use default positioning
    y: null,
    width: null,
    height: null
  });
  const [isPanelDragging, setIsPanelDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const panelRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, panelX: 0, panelY: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0, panelX: 0, panelY: 0 });

  // Panel drag handlers
  const handlePanelDragStart = (e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea')) return;
    e.preventDefault();

    const panel = panelRef.current;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panelX: panelBounds.x ?? rect.left,
      panelY: panelBounds.y ?? rect.top
    };

    // Initialize bounds if not set
    if (panelBounds.x === null) {
      setPanelBounds(prev => ({
        ...prev,
        x: rect.left,
        y: rect.top,
        width: prev.width ?? rect.width,
        height: prev.height ?? rect.height
      }));
    }

    setIsPanelDragging(true);
  };

  const handlePanelDragMove = (e) => {
    if (!isPanelDragging) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    setPanelBounds(prev => ({
      ...prev,
      x: dragStartRef.current.panelX + deltaX,
      y: dragStartRef.current.panelY + deltaY
    }));
  };

  const handlePanelDragEnd = () => {
    setIsPanelDragging(false);
  };

  // Panel resize handlers
  const handleResizeStart = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();

    const panel = panelRef.current;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: panelBounds.width ?? rect.width,
      height: panelBounds.height ?? rect.height,
      panelX: panelBounds.x ?? rect.left,
      panelY: panelBounds.y ?? rect.top
    };

    // Initialize bounds if not set
    if (panelBounds.x === null) {
      setPanelBounds({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      });
    }

    setResizeDirection(direction);
    setIsResizing(true);
  };

  const handleResizeMove = (e) => {
    if (!isResizing || !resizeDirection) return;

    const deltaX = e.clientX - resizeStartRef.current.x;
    const deltaY = e.clientY - resizeStartRef.current.y;
    const minWidth = 320;
    const minHeight = 300;

    setPanelBounds(prev => {
      const newBounds = { ...prev };

      if (resizeDirection.includes('e')) {
        newBounds.width = Math.max(minWidth, resizeStartRef.current.width + deltaX);
      }
      if (resizeDirection.includes('w')) {
        const newWidth = Math.max(minWidth, resizeStartRef.current.width - deltaX);
        newBounds.width = newWidth;
        newBounds.x = resizeStartRef.current.panelX + (resizeStartRef.current.width - newWidth);
      }
      if (resizeDirection.includes('s')) {
        newBounds.height = Math.max(minHeight, resizeStartRef.current.height + deltaY);
      }
      if (resizeDirection.includes('n')) {
        const newHeight = Math.max(minHeight, resizeStartRef.current.height - deltaY);
        newBounds.height = newHeight;
        newBounds.y = resizeStartRef.current.panelY + (resizeStartRef.current.height - newHeight);
      }

      return newBounds;
    });
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeDirection(null);
  };

  // Global mouse move/up listeners for drag and resize
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isPanelDragging) {
        handlePanelDragMove(e);
      } else if (isResizing) {
        handleResizeMove(e);
      }
    };

    const handleMouseUp = () => {
      if (isPanelDragging) {
        handlePanelDragEnd();
      }
      if (isResizing) {
        handleResizeEnd();
      }
    };

    if (isPanelDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = isPanelDragging ? 'grabbing' :
        resizeDirection?.includes('n') && resizeDirection?.includes('e') ? 'nesw-resize' :
        resizeDirection?.includes('n') && resizeDirection?.includes('w') ? 'nwse-resize' :
        resizeDirection?.includes('s') && resizeDirection?.includes('e') ? 'nwse-resize' :
        resizeDirection?.includes('s') && resizeDirection?.includes('w') ? 'nesw-resize' :
        resizeDirection?.includes('n') || resizeDirection?.includes('s') ? 'ns-resize' :
        'ew-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isPanelDragging, isResizing, resizeDirection]);

  // Reset panel bounds when panel closes
  useEffect(() => {
    if (!showEnginePanel) {
      setPanelBounds({ x: null, y: null, width: null, height: null });
    }
  }, [showEnginePanel]);

  const loadingSteps = [
    'Analyzing your question...',
    'Identifying key themes...',
    'Mapping considerations...',
    'Building framework...',
    'Preparing guidance...'
  ];

  const considerations = [
    {
      id: 1,
      title: 'Technical Compatibility',
      description: 'Compatibility assessments are crucial for determining viability.',
      clarifyingQuestion: 'What challenges have you encountered when assessing the compatibility of existing door hardware with new systems like Assa Abloy?',
      exampleSnippets: [
        'At our property, we\'ve identified connectivity challenges in older buildings that may impact the Assa Abloy integration.',
        'Our existing door frames use non-standard dimensions that will require adapter plates for the new locks.',
        'The legacy wiring in Building C cannot support the power requirements for smart locks.'
      ]
    },
    {
      id: 2,
      title: 'Cost Analysis',
      description: 'Understanding costs is essential for budgeting.',
      clarifyingQuestion: 'What are the primary cost drivers you\'re considering for this retrofit project?',
      exampleSnippets: [
        'We need to evaluate upfront hardware costs against long-term savings from reduced maintenance.',
        'Installation labor is our biggest concern, especially for doors requiring frame modifications.',
        'We\'re exploring bulk purchase discounts for orders over 100 units.'
      ]
    },
    {
      id: 3,
      title: 'Code Compliance',
      description: 'Compliance ensures legal operation and security.',
      clarifyingQuestion: 'What security or compliance requirements are driving this upgrade?',
      exampleSnippets: [
        'Our primary compliance concern is ensuring proper emergency egress while enhancing audit capabilities.',
        'We need all locks to fail-safe during fire alarms per NFPA 101 requirements.',
        'ADA accessibility requirements mandate specific mounting heights and operation methods.'
      ]
    },
    {
      id: 4,
      title: 'IT and PMS Integration',
      description: 'Integration with existing systems is vital for operations.',
      clarifyingQuestion: 'How does your current PMS handle room access, and what integration points are critical?',
      exampleSnippets: [
        'Our Opera PMS needs real-time integration for mobile key delivery at check-in.',
        'We require fallback procedures for when the cloud connection is unavailable.',
        'API compatibility with our existing access control system is essential.'
      ]
    }
  ];

  // Mouse-based drag handlers
  const handleMouseDown = (e, message) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDraggingSnippet(message);
    setDragPosition({ x: e.clientX - rect.width / 2, y: e.clientY - 20 });
    
    const handleMouseMove = (e) => {
      setDragPosition({ x: e.clientX - 100, y: e.clientY - 20 });
      
      // Check if over drop zone
      if (dropZoneRef.current) {
        const dropRect = dropZoneRef.current.getBoundingClientRect();
        const isOver = e.clientX >= dropRect.left && e.clientX <= dropRect.right &&
                       e.clientY >= dropRect.top && e.clientY <= dropRect.bottom;
        setIsOverDropZone(isOver);
      }
    };
    
    const handleMouseUp = (e) => {
      // Check drop zone one final time
      let droppedOnZone = false;
      if (dropZoneRef.current) {
        const dropRect = dropZoneRef.current.getBoundingClientRect();
        droppedOnZone = e.clientX >= dropRect.left && e.clientX <= dropRect.right &&
                        e.clientY >= dropRect.top && e.clientY <= dropRect.bottom;
      }
      
      if (droppedOnZone) {
        // Trigger the same flow as clicking "Paste"
        // We need to delay this slightly to let the drag state clear first
        setTimeout(() => {
          handleAddSnippetWithLoading(message);
        }, 50);
      }
      
      setDraggingSnippet(null);
      setIsOverDropZone(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Check drop zone on drag position change
  useEffect(() => {
    if (draggingSnippet && dropZoneRef.current) {
      const dropRect = dropZoneRef.current.getBoundingClientRect();
      const isOver = dragPosition.x >= dropRect.left - 100 && 
                     dragPosition.x <= dropRect.right &&
                     dragPosition.y >= dropRect.top - 20 && 
                     dragPosition.y <= dropRect.bottom;
      setIsOverDropZone(isOver);
    }
  }, [dragPosition, draggingSnippet]);

  const isQuestion = (text) => {
    const trimmed = text.trim();
    if (trimmed.endsWith('?')) return true;
    const questionStarters = ['what', 'why', 'how', 'when', 'where', 'who', 'which', 'can', 'could', 'would', 'should', 'is', 'are', 'do', 'does', 'will'];
    const firstWord = trimmed.toLowerCase().split(' ')[0];
    return questionStarters.includes(firstWord);
  };

  const handleStartEngine = () => {
    setShowEnginePanel(true);
    setPanelCollapsed(false);
    // Select the first consideration by default
    const firstConsideration = considerations[0];
    setActiveConsideration(firstConsideration);
    setChatMessages([{ role: 'assistant', content: firstConsideration.clarifyingQuestion }]);
  };

  const handleSelectConsideration = (consideration) => {
    setActiveConsideration(consideration);
    setChatMessages([{ role: 'assistant', content: consideration.clarifyingQuestion }]);
    setUserInput('');
    setShowAIReference(false);
    setAwaitingClarification(false);
    // Reset response builder state
    setSelectedIdeaIndexes([]);
    setEditingIdeaIndex(null);
    setEditedIdeaText('');
    setEditedIdeas({});
    setRegeneratePrompt('');
    setShowRegenerateOptions(false);
    setFocusChips([]);
  };

  const handleCloseChat = () => {
    setActiveConsideration(null);
    setChatMessages([]);
    setShowAIReference(false);
    setAwaitingClarification(false);
  };

  const handleGetAIHelp = () => {
    setShowAIReference(true);
    // Reset state for new design
    setSelectedIdeaIndexes([]);
    setRegeneratePrompt('');
    setFocusChips([]);
  };

  // Response builder handlers
  const toggleIdeaSelection = (index) => {
    setSelectedIdeaIndexes(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleSaveEdit = (index) => {
    if (editedIdeaText.trim()) {
      setEditedIdeas(prev => ({ ...prev, [index]: editedIdeaText.trim() }));
      // Auto-select after editing
      if (!selectedIdeaIndexes.includes(index)) {
        setSelectedIdeaIndexes(prev => [...prev, index]);
      }
    }
    setEditingIdeaIndex(null);
    setEditedIdeaText('');
  };

  const handleBuildResponse = () => {
    if (selectedIdeaIndexes.length === 0) return;
    
    // Build response from selected ideas in order
    const sortedIndexes = [...selectedIdeaIndexes].sort((a, b) => a - b);
    const response = sortedIndexes
      .map(index => editedIdeas[index] || activeConsideration.exampleSnippets[index])
      .join(' ');
    
    setUserInput(response);
    setShowAIReference(false);
    setSelectedIdeaIndexes([]);
    setEditedIdeas({});
  };

  // Get topic chips based on current consideration
  const getTopicChips = () => {
    if (!activeConsideration) return [];
    
    const chipsByConsideration = {
      'Technical Compatibility': ['power/wiring', 'network', 'legacy systems', 'door hardware'],
      'Cost Analysis': ['labor costs', 'ROI', 'bulk pricing', 'maintenance savings'],
      'Code Compliance': ['fire safety', 'ADA', 'cybersecurity', 'audit trails'],
      'IT and PMS Integration': ['mobile keys', 'API', 'real-time sync', 'fallback plans']
    };
    
    return chipsByConsideration[activeConsideration.title] || ['more specific', 'broader view', 'alternatives'];
  };

  // Handle regenerate with custom prompt
  const handleRegenerate = () => {
    if (!regeneratePrompt.trim()) return;
    // In real implementation, this would call AI to generate new suggestions
    // For now, just show a simulated response
    console.log('Regenerating with prompt:', regeneratePrompt);
    setRegeneratePrompt('');
    // Would update activeConsideration.exampleSnippets with new AI-generated content
  };

  // Handle regenerate with topic chip
  const handleRegenerateWithTopic = (topic) => {
    // In real implementation, this would call AI to generate new suggestions focused on topic
    console.log('Regenerating focused on:', topic);
    // Would update activeConsideration.exampleSnippets with new AI-generated content
  };

  const handleCopyPhrase = (phrase) => {
    setUserInput(prev => prev ? `${prev} ${phrase}` : phrase);
    setCopiedPhrase(phrase);
    setTimeout(() => setCopiedPhrase(null), 1500);
  };

  const handleCopyExample = () => setUserInput(activeConsideration.aiReference.example);

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    const messageText = userInput.trim();
    
    if (isQuestion(messageText) && !awaitingClarification) {
      setChatMessages(prev => [...prev, { role: 'user', content: messageText }]);
      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: 'clarification', content: messageText }]);
        setAwaitingClarification(true);
        setPendingUserMessage(messageText);
      }, 300);
      setUserInput('');
      setShowAIReference(false);
      return;
    }
    
    setChatMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'snippet', 
        content: messageText,
        consideration: activeConsideration.title,
        id: Date.now()
      }]);
    }, 500);
    
    setUserInput('');
    setShowAIReference(false);
    setAwaitingClarification(false);
  };

  const handleClarificationChoice = (choice) => {
    // Mark clarification as resolved and store the choice
    setChatMessages(prev => prev.map(msg => 
      msg.role === 'clarification' && msg.content === pendingUserMessage
        ? { ...msg, resolved: true, choice }
        : msg
    ));
    
    if (choice === 'answer') {
      // Provide a substantive answer based on the consideration
      const answers = {
        'Technical Compatibility': `Great question! For technical compatibility assessments, you'll want to consider several key factors:

• Hardware Compatibility: Check if existing door frames can accommodate the new lock dimensions. Assa Abloy locks typically require specific mortise cutouts.

• Power Requirements: The system needs either hardwired power (24V DC) or battery backup. Older buildings may need electrical upgrades.

• Network Infrastructure: For cloud-connected features, you'll need reliable WiFi or ethernet connectivity at each door location.

• Integration Points: Consider how the new system will communicate with your existing access control infrastructure.`,
        'Cost Analysis': `Good question! Here's what typically drives costs in retrofit projects:

• Hardware Costs: Lock units ($300-800 each), readers, controllers, and mounting hardware. Volume discounts usually kick in at 50+ units.

• Installation Labor: Expect $150-300 per door for professional installation, more for doors requiring frame modifications.

• Infrastructure Upgrades: Network drops, power circuits, and any structural modifications can add 20-30% to base costs.

• Soft Costs: Training, temporary access solutions during transition, and project management.`,
        'Code Compliance': `Important question! Compliance requirements vary by jurisdiction, but here are the common ones:

• Fire Codes: All locks must fail-safe (unlock) during fire alarms. Exit devices must meet NFPA 101 requirements.

• ADA Requirements: Hardware must be operable without tight grasping or twisting. Mounting height 34-48 inches.

• Cybersecurity: For hospitality, PCI-DSS may apply if integrated with payment systems. Consider encryption standards.

• Audit Requirements: Many industries require detailed access logs with tamper-evident storage.`,
        'IT and PMS Integration': `Great question! PMS integration is critical for guest experience:

• Real-time Sync: Room assignments should trigger immediate credential provisioning. Latency over 30 seconds impacts check-in flow.

• Mobile Key Delivery: Requires BLE-enabled locks and a mobile app integration. Check if your PMS supports the necessary APIs.

• Fallback Procedures: Always have backup credential methods (physical cards, front desk override) for system outages.

• API Compatibility: Verify your PMS has certified integration with Assa Abloy's Vostio or similar platform.`
      };
      
      const answer = answers[activeConsideration.title] || `That's a great question about ${activeConsideration.title.toLowerCase()}. The key factors to consider are compatibility with existing infrastructure, potential integration challenges, and long-term maintenance implications.`;
      
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          role: 'assistant',
          content: answer,
          isAnswer: true, // Flag to show "save as snippet" option
          id: Date.now()
        }]);
      }, 300);
    } else {
      const snippetId = Date.now();
      setTimeout(() => {
        // Collapse all previous snippets for this consideration
        setChatMessages(prev => prev.map(msg => 
          msg.role === 'snippet' && msg.consideration === activeConsideration.title
            ? { ...msg, dismissed: true }
            : msg
        ));
        
        setChatMessages(prev => [...prev, { 
          role: 'snippet', 
          content: `We need to evaluate ${pendingUserMessage.replace('?', '').toLowerCase()} as part of our ${activeConsideration.title.toLowerCase()} assessment.`,
          consideration: activeConsideration.title,
          id: snippetId
        }]);
        
        // Auto-add follow-up question after snippet
        const followUpQuestions = {
          'Technical Compatibility': 'Are there any specific legacy systems or older door frames that concern you most for this integration?',
          'Cost Analysis': 'Have you identified any potential cost savings or ROI factors we should factor into this assessment?',
          'Code Compliance': 'Are there any upcoming regulatory changes or audits that might affect this timeline?',
          'IT and PMS Integration': 'What backup procedures are currently in place if the integration experiences downtime?'
        };
        const question = followUpQuestions[activeConsideration.title] || 'Is there anything else you\'d like to add to strengthen this point?';
        
        setTimeout(() => {
          setChatMessages(prev => [...prev, { 
            role: 'assistant',
            content: question,
            isFollowUp: true,
            parentSnippetId: snippetId
          }]);
        }, 400);
      }, 300);
    }
    setAwaitingClarification(false);
    setPendingUserMessage('');
  };

  // Handle saving an AI answer as a snippet
  const handleSaveAnswerAsSnippet = (message) => {
    const snippetContent = {
      'Technical Compatibility': `Based on our technical assessment, the retrofit will require evaluation of door frame compatibility, power infrastructure (24V DC or battery), network connectivity at each door, and integration with existing access control systems.`,
      'Cost Analysis': `Our cost analysis should account for hardware ($300-800/unit), installation labor ($150-300/door), infrastructure upgrades (20-30% of base), and soft costs including training and temporary access solutions.`,
      'Code Compliance': `Compliance requirements include fire code fail-safe mechanisms per NFPA 101, ADA-compliant hardware mounting (34-48"), applicable cybersecurity standards, and audit trail capabilities for access logging.`,
      'IT and PMS Integration': `PMS integration requirements include real-time credential sync (<30s latency), mobile key delivery via BLE, robust fallback procedures for outages, and verified API compatibility with our current system.`
    };
    
    const content = snippetContent[activeConsideration.title] || `Key points from our ${activeConsideration.title.toLowerCase()} discussion have been noted for the assessment.`;
    
    // Mark the message as having been saved
    setChatMessages(prev => prev.map(msg => 
      msg.id === message.id ? { ...msg, savedAsSnippet: true } : msg
    ));
    
    // Add the snippet
    const snippetId = Date.now();
    setTimeout(() => {
      // Collapse all previous snippets for this consideration
      setChatMessages(prev => prev.map(msg => 
        msg.role === 'snippet' && msg.consideration === activeConsideration.title
          ? { ...msg, dismissed: true }
          : msg
      ));
      
      setChatMessages(prev => [...prev, { 
        role: 'snippet', 
        content: content,
        consideration: activeConsideration.title,
        id: snippetId,
        synthesizedFromAnswer: true
      }]);
      
      // Auto-add follow-up question after snippet
      const followUpQuestions = {
        'Technical Compatibility': 'Are there any specific legacy systems or older door frames that concern you most for this integration?',
        'Cost Analysis': 'Have you identified any potential cost savings or ROI factors we should factor into this assessment?',
        'Code Compliance': 'Are there any upcoming regulatory changes or audits that might affect this timeline?',
        'IT and PMS Integration': 'What backup procedures are currently in place if the integration experiences downtime?'
      };
      const question = followUpQuestions[activeConsideration.title] || 'Is there anything else you\'d like to add to strengthen this point?';
      
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          role: 'assistant',
          content: question,
          isFollowUp: true,
          parentSnippetId: snippetId
        }]);
      }, 400);
    }, 300);
  };

  // Handle "Keep refining below" - scroll to input and focus
  const handleKeepTalking = (message) => {
    // Mark the snippet as dismissed (won't show buttons anymore)
    setChatMessages(prev => prev.map(msg => 
      msg.id === message.id ? { ...msg, dismissed: true } : msg
    ));
    
    // Focus on the input field and scroll to it
    setTimeout(() => {
      if (chatInputRef.current) {
        chatInputRef.current.focus();
        chatInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleAddSnippet = (content, considerationTitle, messageId) => {
    setSnippets(prev => [...prev, { consideration: considerationTitle, content }]);
    setChatMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, added: true } : msg));
  };

  const handleClosePanel = () => {
    setShowEnginePanel(false);
    setPanelCollapsed(false);
    setActiveConsideration(null);
    setChatMessages([]);
    setAwaitingClarification(false);
  };

  // Custom position indicator components
  const LeftPositionIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="2" width="5" height="12" rx="1" fill="currentColor" />
      <rect x="8" y="2" width="7" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
    </svg>
  );
  
  const BottomPositionIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="1" width="12" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
      <rect x="2" y="10" width="12" height="5" rx="1" fill="currentColor" />
    </svg>
  );
  
  const RightPositionIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="2" width="7" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
      <rect x="10" y="2" width="5" height="12" rx="1" fill="currentColor" />
    </svg>
  );

  const PositionButton = ({ position, label }) => {
    const IconComponent = position === 'left' ? LeftPositionIcon 
      : position === 'bottom' ? BottomPositionIcon 
      : RightPositionIcon;
    
    return (
      <button
        onClick={() => setPanelPosition(position)}
        className={`p-1.5 rounded transition-colors ${
          panelPosition === position ? 'bg-white/30 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
        title={label}
      >
        <IconComponent />
      </button>
    );
  };

  const getPanelStyles = () => {
    const base = 'bg-white shadow-2xl flex flex-col rounded-2xl overflow-hidden';
    const hasChat = activeConsideration !== null;

    // If custom bounds are set (user has dragged/resized), use fixed positioning
    if (panelBounds.x !== null) {
      return {
        className: `${base} fixed`,
        style: {
          left: panelBounds.x,
          top: panelBounds.y,
          width: panelBounds.width || (hasChat ? 680 : 320),
          height: panelBounds.height || 480
        }
      };
    }

    // Default: floating panel with fixed size (not full height)
    // Mobile: full screen, Desktop: floating panel
    const defaultWidth = hasChat ? 680 : 320;
    const defaultHeight = 480;

    return {
      className: `${base} absolute inset-0 sm:inset-auto sm:left-4 sm:top-1/2 sm:-translate-y-1/2`,
      style: {
        width: window.innerWidth >= 640 ? defaultWidth : '100%',
        height: window.innerWidth >= 640 ? defaultHeight : '100%',
        maxHeight: window.innerWidth >= 640 ? 'calc(100vh - 2rem)' : '100%'
      }
    };
  };

  // Handle continue after snippet added - ask follow-up question
  const handleContinueAfterSnippet = (message) => {
    // Mark this snippet as active (being refined)
    setChatMessages(prev => prev.map(msg => 
      msg.id === message.id ? { ...msg, active: true } : msg
    ));
    
    const followUpQuestions = {
      'Technical Compatibility': 'Are there any specific legacy systems or older door frames that concern you most for this integration?',
      'Cost Analysis': 'Have you identified any potential cost savings or ROI factors we should factor into this assessment?',
      'Code Compliance': 'Are there any upcoming regulatory changes or audits that might affect this timeline?',
      'IT and PMS Integration': 'What backup procedures are currently in place if the integration experiences downtime?'
    };
    
    const question = followUpQuestions[message.consideration] || 'Is there anything else you\'d like to add to strengthen this point?';
    
    setChatMessages(prev => [...prev, { 
      role: 'assistant', 
      content: question,
      isFollowUp: true,
      parentSnippetId: message.id
    }]);
  };

  // Handle pause - user is satisfied with this consideration for now
  const handlePauseConsideration = (message) => {
    setChatMessages(prev => prev.map(msg => 
      msg.id === message.id ? { ...msg, paused: true, active: false } : msg
    ));
  };

  // Handle resume - user wants to continue refining this snippet
  const handleResumeConsideration = (message) => {
    setChatMessages(prev => prev.map(msg => 
      msg.id === message.id ? { ...msg, paused: false, active: true } : msg
    ));
    // Trigger the continue flow (but don't call handleContinueAfterSnippet since it would set active again)
    const followUpQuestions = {
      'Technical Compatibility': 'Are there any specific legacy systems or older door frames that concern you most for this integration?',
      'Cost Analysis': 'Have you identified any potential cost savings or ROI factors we should factor into this assessment?',
      'Code Compliance': 'Are there any upcoming regulatory changes or audits that might affect this timeline?',
      'IT and PMS Integration': 'What backup procedures are currently in place if the integration experiences downtime?'
    };
    
    const question = followUpQuestions[message.consideration] || 'Is there anything else you\'d like to add to strengthen this point?';
    
    setChatMessages(prev => [...prev, { 
      role: 'assistant', 
      content: question,
      isFollowUp: true,
      parentSnippetId: message.id
    }]);
  };

  // Get AI reasoning for snippet
  const getSnippetReasoning = (message) => {
    if (message.isFollowUp) {
      return 'Updated based on your additional context';
    }
    // Check if multiple ideas were selected (from response builder)
    const wordCount = message.content.split(' ').length;
    if (wordCount > 30) {
      return 'Combined your selected points into a cohesive response';
    }
    return 'Captured your key insight about ' + (message.consideration || 'this consideration').toLowerCase();
  };

  // Modified send message to handle follow-up snippets
  const handleSendMessageWithFollowUp = () => {
    if (!userInput.trim()) return;
    const messageText = userInput.trim();
    
    // Check if this is a response to a follow-up question
    const lastMessage = chatMessages[chatMessages.length - 1];
    const isFollowUpResponse = lastMessage?.isFollowUp;
    
    if (isQuestion(messageText) && !awaitingClarification && !isFollowUpResponse) {
      setChatMessages(prev => [...prev, { role: 'user', content: messageText }]);
      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: 'clarification', content: messageText }]);
        setAwaitingClarification(true);
        setPendingUserMessage(messageText);
      }, 300);
      setUserInput('');
      setShowAIReference(false);
      return;
    }
    
    setChatMessages(prev => [...prev, { role: 'user', content: messageText }]);
    
    // Generate snippet - combine with previous content if follow-up
    const snippetId = Date.now();
    
    // Find the parent snippet content if this is a follow-up
    let combinedContent = messageText;
    if (isFollowUpResponse && lastMessage?.parentSnippetId) {
      const parentSnippet = chatMessages.find(msg => msg.id === lastMessage.parentSnippetId);
      if (parentSnippet?.content) {
        combinedContent = `${parentSnippet.content} Additionally, ${messageText.charAt(0).toLowerCase() + messageText.slice(1)}`;
      }
    }
    
    setTimeout(() => {
      // Collapse all previous snippets for this consideration
      setChatMessages(prev => prev.map(msg => 
        msg.role === 'snippet' && msg.consideration === activeConsideration.title
          ? { ...msg, dismissed: true }
          : msg
      ));
      
      setChatMessages(prev => [...prev, { 
        role: 'snippet', 
        content: combinedContent,
        consideration: activeConsideration.title,
        id: snippetId,
        isFollowUp: isFollowUpResponse,
        parentSnippetId: lastMessage?.parentSnippetId
      }]);
      
      // Auto-add follow-up question after snippet
      const followUpQuestions = {
        'Technical Compatibility': 'Are there any specific legacy systems or older door frames that concern you most for this integration?',
        'Cost Analysis': 'Have you identified any potential cost savings or ROI factors we should factor into this assessment?',
        'Code Compliance': 'Are there any upcoming regulatory changes or audits that might affect this timeline?',
        'IT and PMS Integration': 'What backup procedures are currently in place if the integration experiences downtime?'
      };
      const question = followUpQuestions[activeConsideration.title] || 'Is there anything else you\'d like to add to strengthen this point?';
      
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          role: 'assistant',
          content: question,
          isFollowUp: true,
          parentSnippetId: snippetId
        }]);
      }, 400);
    }, 500);
    
    setUserInput('');
    setShowAIReference(false);
    setAwaitingClarification(false);
  };

  // Handle add snippet click with loading states
  const handleAddSnippetWithLoading = (message) => {
    // Immediately collapse panel and start building animation
    setPanelCollapsed(true);
    setIsBuildingAnswer(true);
    
    // Get the version number of the snippet being added
    const snippetVersions = chatMessages
      .filter(msg => msg.role === 'snippet' && msg.consideration === message.consideration)
      .map(msg => msg.id);
    const versionNum = snippetVersions.indexOf(message.id) + 1;
    
    // Mark all previous snippets for this consideration as "includedIn" this version
    // This includes both drafts AND previously added versions
    setChatMessages(prev => prev.map(msg => {
      if (msg.role === 'snippet' && msg.consideration === message.consideration && msg.id !== message.id) {
        return { ...msg, includedIn: versionNum, dismissed: false, added: false };
      }
      if (msg.id === message.id) {
        return { ...msg, added: true, addedVersion: versionNum };
      }
      return msg;
    }));
    
    // Add to snippets (or update existing if follow-up)
    if (message.isFollowUp && message.parentSnippetId) {
      setSnippets(prev => prev.map(s => 
        s.consideration === message.consideration 
          ? { ...s, content: message.content, version: (s.version || 1) + 1 }
          : s
      ));
    } else {
      setSnippets(prev => [...prev, { consideration: message.consideration, content: message.content, version: 1 }]);
    }
    
    // After 6 seconds, populate the answer textarea
    setTimeout(() => {
      setIsBuildingAnswer(false);
      setDirectInput(prev => {
        const newContent = message.content;
        return prev ? `${prev}\n\n${newContent}` : newContent;
      });
    }, 6000);
  };

  // Draggable Snippet Component
  const DraggableSnippet = ({ message }) => {
    // Active state - currently being refined (after Continue)
    if (message.active && !message.paused) {
      // Calculate version number
      const snippetVersions = chatMessages
        .filter(msg => msg.role === 'snippet' && msg.consideration === message.consideration)
        .map(msg => msg.id);
      const versionNum = snippetVersions.indexOf(message.id) + 1;
      
      return (
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
            <MessageSquare size={12} className="text-teal-600" />
          </div>
          <div className="bg-teal-50 rounded-2xl rounded-tl-md px-3 py-2 border border-teal-200 max-w-[90%]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-teal-200 rounded text-xs font-medium text-teal-800">v{versionNum}</span>
                <span className="text-xs text-teal-600 font-medium">💬 Refining</span>
              </div>
              <button 
                onClick={() => handlePauseConsideration(message)}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
              >
                <Pause size={10} />
                Pause
              </button>
            </div>
            <p className="text-sm text-teal-700 italic line-clamp-1">"{message.content}"</p>
          </div>
        </div>
      );
    }
    
    // Paused state - collapsed with resume option
    if (message.paused) {
      // Calculate version number
      const snippetVersions = chatMessages
        .filter(msg => msg.role === 'snippet' && msg.consideration === message.consideration)
        .map(msg => msg.id);
      const versionNum = snippetVersions.indexOf(message.id) + 1;
      
      return (
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Check size={12} className="text-gray-400" />
          </div>
          <div className="bg-gray-50 rounded-2xl rounded-tl-md px-3 py-2 border border-dashed border-gray-200 max-w-[90%]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-medium text-gray-600">v{versionNum}</span>
                <span className="text-xs text-gray-400">✓ Saved</span>
              </div>
              <button 
                onClick={() => handleResumeConsideration(message)}
                className="text-xs text-teal-600 hover:text-teal-800 flex items-center gap-1 transition-colors font-medium"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Resume
              </button>
            </div>
            <p className="text-sm text-gray-400 italic line-clamp-1">"{message.content}"</p>
          </div>
        </div>
      );
    }
    
    // Final added state - with View button
    if (message.added) {
      // Calculate version number
      const snippetVersions = chatMessages
        .filter(msg => msg.role === 'snippet' && msg.consideration === message.consideration)
        .map(msg => msg.id);
      const versionNum = snippetVersions.indexOf(message.id) + 1;
      
      return (
        <div className="flex gap-2 animate-fadeIn">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check size={12} className="text-green-600" />
          </div>
          <div className="bg-green-50 rounded-2xl rounded-tl-md px-3 py-2 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-green-200 rounded text-xs font-medium text-green-800">v{versionNum}</span>
                <span className="text-xs text-green-400">·</span>
                <span className="text-xs text-green-600">In answer</span>
              </div>
              <button 
                onClick={() => {
                  setChatMessages(prev => prev.map(msg => 
                    msg.id === message.id ? { ...msg, expanded: !msg.expanded } : msg
                  ));
                }}
                className="text-xs text-green-600 hover:text-green-800 transition-colors ml-3"
              >
                View
              </button>
            </div>
            {message.expanded && (
              <p className="text-sm text-green-700 mt-2 pt-2 border-t border-green-200">"{message.content}"</p>
            )}
          </div>
        </div>
      );
    }

    // Included in later version state (only shown when showVersionHistory is true)
    if (message.includedIn) {
      if (!showVersionHistory) {
        return null; // Hide when version history toggle is off
      }
      
      // Calculate version number
      const snippetVersions = chatMessages
        .filter(msg => msg.role === 'snippet' && msg.consideration === message.consideration)
        .map(msg => msg.id);
      const versionNum = snippetVersions.indexOf(message.id) + 1;
      
      return (
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Check size={12} className="text-gray-400" />
          </div>
          <div className="bg-gray-50 rounded-2xl rounded-tl-md px-3 py-2 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-gray-500">v{versionNum}</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400">Included in v{message.includedIn}</span>
              </div>
              <button 
                onClick={() => {
                  setChatMessages(prev => prev.map(msg => 
                    msg.id === message.id ? { ...msg, expanded: !msg.expanded } : msg
                  ));
                }}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors ml-3"
              >
                View
              </button>
            </div>
            {message.expanded && (
              <p className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-200">"{message.content}"</p>
            )}
          </div>
        </div>
      );
    }

    // Dismissed state - user clicked "Keep refining", collapsed but using as context
    if (message.dismissed) {
      // Calculate version number
      const snippetVersions = chatMessages
        .filter(msg => msg.role === 'snippet' && msg.consideration === message.consideration)
        .map(msg => msg.id);
      const versionNum = snippetVersions.indexOf(message.id) + 1;
      
      return (
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Sparkles size={12} className="text-amber-300" />
          </div>
          <div className="bg-amber-50/50 rounded-2xl rounded-tl-md px-3 py-2 border border-amber-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-amber-600/70">v{versionNum}</span>
                <span className="text-xs text-amber-400">·</span>
                <span className="text-xs text-amber-500/70">Snippet</span>
              </div>
              <button 
                onClick={() => {
                  // Restore this snippet to active state
                  setChatMessages(prev => prev.map(msg => 
                    msg.id === message.id ? { ...msg, dismissed: false } : msg
                  ));
                }}
                className="text-xs text-amber-600 hover:text-amber-800 flex items-center gap-1 transition-colors ml-3"
              >
                View
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Default draggable state
    // Calculate version number
    const snippetVersions = chatMessages
      .filter(msg => msg.role === 'snippet' && msg.consideration === message.consideration)
      .map(msg => msg.id);
    const versionNum = snippetVersions.indexOf(message.id) + 1;
    
    return (
      <div className="flex gap-2">
        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Sparkles size={12} className="text-amber-600" />
        </div>
        <div className="bg-amber-50 rounded-2xl rounded-tl-md px-3 py-2 border-2 border-dashed border-amber-300 max-w-[90%]">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-1.5 py-0.5 bg-amber-200 rounded text-xs font-medium text-amber-800">v{versionNum}</span>
            <p className="text-xs text-amber-700">
              {message.synthesizedFromAnswer 
                ? "Synthesized from my answer"
                : message.isFollowUp 
                  ? "Building on previous"
                  : "Snippet available"}
            </p>
          </div>
          
          {/* AI Reasoning for draft */}
          <div className="flex items-start gap-1.5 mb-2 px-2 py-1.5 bg-amber-100/50 rounded-lg">
            <span className="text-xs">💭</span>
            <p className="text-xs text-amber-700">
              {message.synthesizedFromAnswer 
                ? 'Extracted the key points from my answer above'
                : message.isFollowUp 
                  ? 'Incorporated your new details with the existing context'
                  : "I've incorporated your details to progressively build the answer."}
            </p>
          </div>
          
          <div 
            onMouseDown={(e) => handleMouseDown(e, message)}
            className="bg-white rounded-lg p-2 border border-amber-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-amber-400 transition-all mb-2 select-none"
          >
            <div className="flex items-center gap-2 mb-1">
              <GripVertical size={14} className="text-amber-400" />
              <p className="text-xs text-amber-600">Drag to paste</p>
            </div>
            <p className="text-sm text-gray-800 font-medium">"{message.content}"</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleKeepTalking(message)}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-colors"
            >
              Keep refining below
            </button>
            <span className="text-xs text-gray-400">or</span>
            <button 
              onClick={() => handleAddSnippetWithLoading(message)}
              className="px-3 py-1.5 bg-amber-400 text-gray-900 rounded-lg text-xs font-medium hover:bg-amber-500 transition-colors flex items-center gap-1"
            >
              <Plus size={12} />
              Paste
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Considerations List Panel
  const ConsiderationsPanel = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        {considerations.map((consideration) => {
          const isCompleted = snippets.some(s => s.consideration === consideration.title);
          const isActive = activeConsideration?.id === consideration.id;
          return (
            <div
              key={consideration.id}
              onClick={() => handleSelectConsideration(consideration)}
              className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-all border-l-2 ${
                isActive
                  ? 'border-l-teal-500 bg-teal-50/50'
                  : 'border-l-transparent hover:bg-gray-50'
              }`}
            >
              {/* Grip icon */}
              <div className={`flex-shrink-0 ${isActive ? 'text-teal-400' : 'text-gray-300'}`}>
                <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
                  <rect x="0" y="0" width="12" height="2" rx="1" />
                  <rect x="0" y="6" width="12" height="2" rx="1" />
                  <rect x="0" y="12" width="12" height="2" rx="1" />
                </svg>
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium leading-snug ${
                  isActive ? 'text-gray-900' : isCompleted ? 'text-gray-700' : 'text-gray-700'
                }`}>
                  {consideration.title}
                </span>
              </div>

              {/* Chevron for active item */}
              {isActive && (
                <ChevronRight size={16} className="flex-shrink-0 text-teal-500" />
              )}

              {/* Completed indicator */}
              {isCompleted && !isActive && (
                <Check size={14} className="flex-shrink-0 text-green-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Chat Panel
  // Get all snippet versions for current consideration (from chat messages)
  const getSnippetVersions = () => {
    if (!activeConsideration) return [];
    return chatMessages
      .filter(msg => msg.role === 'snippet' && msg.consideration === activeConsideration.title)
      .map((msg, index) => ({
        version: index + 1,
        content: msg.content,
        id: msg.id,
        added: msg.added,
        paused: msg.paused,
        active: msg.active,
        dismissed: msg.dismissed,
        includedIn: msg.includedIn
      }));
  };

  // Snippet version badge component
  const SnippetVersionBadge = () => {
    const versions = getSnippetVersions();
    const [showHistory, setShowHistory] = useState(false);
    
    if (versions.length === 0) return null;
    
    // Current version is the latest one that's added, active, or draft (not dismissed or included)
    const currentVersion = versions.filter(v => !v.dismissed && !v.includedIn).pop();
    const currentVersionNum = currentVersion ? versions.indexOf(currentVersion) + 1 : versions.length;
    
    return (
      <div 
        className="relative"
        onMouseEnter={() => setShowHistory(true)}
        onMouseLeave={() => setShowHistory(false)}
      >
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer transition-colors ${
          currentVersion?.added 
            ? 'bg-green-100 hover:bg-green-200' 
            : 'bg-amber-100 hover:bg-amber-200'
        }`}>
          {currentVersion?.added 
            ? <CheckCircle2 size={12} className="text-green-600" />
            : <Sparkles size={12} className="text-amber-600" />
          }
          <span className={`text-xs font-medium ${currentVersion?.added ? 'text-green-800' : 'text-amber-800'}`}>
            Snippet v{currentVersionNum}
          </span>
        </div>
        
        {/* Hover history dropdown */}
        {showHistory && versions.length > 0 && (
          <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-700">Version history</p>
            </div>
            <div className="max-h-48 overflow-auto">
              {[...versions].reverse().map((v, i) => {
                const vNum = versions.length - i;
                const isCurrent = vNum === currentVersionNum && !v.dismissed && !v.includedIn;
                
                return (
                  <div 
                    key={v.id} 
                    className={`px-3 py-2 border-b border-gray-50 last:border-0 ${isCurrent ? 'bg-amber-50' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-medium ${isCurrent ? 'text-amber-700' : 'text-gray-600'}`}>
                          v{vNum}
                        </span>
                        {isCurrent && (
                          <span className="text-xs text-amber-600">← current</span>
                        )}
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        v.added ? 'bg-green-100 text-green-700' 
                        : v.includedIn ? 'bg-green-50 text-green-600'
                        : v.active ? 'bg-teal-100 text-teal-700'
                        : v.paused ? 'bg-gray-100 text-gray-600'
                        : v.dismissed ? 'bg-amber-100 text-amber-600'
                        : 'bg-amber-100 text-amber-700'
                      }`}>
                        {v.added ? 'added' : v.includedIn ? `in v${v.includedIn}` : v.active ? 'refining' : v.paused ? 'paused' : v.dismissed ? 'skipped' : 'current'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">"{v.content}"</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const ChatPanel = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
        <div className="flex items-center gap-2">
          {/* Mobile back button */}
          <button 
            onClick={handleCloseChat} 
            className="sm:hidden p-1.5 -ml-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <h3 className="font-semibold text-gray-900 text-sm">{activeConsideration.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <SnippetVersionBadge />
          {/* Version history toggle */}
          {chatMessages.some(msg => msg.role === 'snippet' && msg.includedIn) && (
            <button 
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              className={`p-1.5 rounded-lg transition-colors ${
                showVersionHistory 
                  ? 'bg-gray-200 text-gray-700' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title={showVersionHistory ? 'Hide version history' : 'Show version history'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </button>
          )}
          <button onClick={handleCloseChat} className="hidden sm:block p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto space-y-3 pr-1">
        {chatMessages.map((message, i) => (
          <div key={i}>
            {message.role === 'assistant' && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={12} className="text-teal-600" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-md px-3 py-2 shadow-sm border border-gray-100 max-w-[90%]">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.content}</p>
                  {message.isFollowUp && (
                    <p className="text-xs text-teal-600 mt-1 flex items-center gap-1">
                      <Sparkles size={10} />
                      Follow-up question
                    </p>
                  )}
                  {message.isAnswer && !message.savedAsSnippet && (
                    <button 
                      onClick={() => handleSaveAnswerAsSnippet(message)}
                      className="mt-2 text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors"
                    >
                      <Lightbulb size={12} />
                      Save key points as snippet
                    </button>
                  )}
                  {message.savedAsSnippet && (
                    <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                      <Check size={12} />
                      Saved as snippet
                    </p>
                  )}
                </div>
              </div>
            )}
            {message.role === 'system' && (
              <div className="flex justify-center">
                <div className="bg-gray-100 rounded-full px-4 py-1.5 text-xs text-gray-600">
                  {message.content}
                </div>
              </div>
            )}
            {message.role === 'user' && (
              <div className="flex justify-end">
                <div className="bg-gray-800 text-white rounded-2xl rounded-tr-md px-3 py-2 text-sm max-w-[90%]">{message.content}</div>
              </div>
            )}
            {message.role === 'clarification' && !message.resolved && (
              <div className="flex justify-end">
                <div className="inline-flex items-center gap-1.5">
                  <button 
                    onClick={() => handleClarificationChoice('answer')} 
                    className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-100 hover:border-gray-300 transition-colors flex items-center gap-1.5"
                  >
                    <MessageSquare size={11} />
                    Help me understand
                  </button>
                  <button 
                    onClick={() => handleClarificationChoice('snippet')} 
                    className="px-2.5 py-1 bg-teal-600 text-white rounded-full text-xs font-medium hover:bg-teal-700 transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles size={11} />
                    Capture this
                  </button>
                </div>
              </div>
            )}
            {message.role === 'clarification' && message.resolved && (
              <div className="flex justify-end">
                <span className="text-xs text-gray-400 italic">
                  {message.choice === 'answer' ? 'Help me understand' : 'Captured'}
                </span>
              </div>
            )}
            {message.role === 'snippet' && <DraggableSnippet message={message} />}
          </div>
        ))}
      </div>

      {showAIReference && (
        <div className="mt-3 p-3 bg-gradient-to-b from-amber-50 to-white rounded-xl border border-amber-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span className="text-xs font-medium text-gray-900">Draft my response</span>
            </div>
            <button onClick={() => {
              setShowAIReference(false);
              setFocusChips([]);
              setRegeneratePrompt('');
            }} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
          </div>
          
          <p className="text-xs text-gray-400 mb-2">Answer agent suggestions</p>
          
          {/* Topic chips */}
          <div className="flex flex-wrap gap-1.5 sm:gap-1.5 mb-3">
            {getTopicChips().map((chip, i) => {
              const isSelected = selectedIdeaIndexes.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => toggleIdeaSelection(i)}
                  className={`px-3 py-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs transition-all ${
                    isSelected 
                      ? 'bg-teal-500 text-white' 
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-300 hover:bg-amber-50 active:bg-amber-100'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
          
          {/* Focus input with chips */}
          <div className="mb-3">
            <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 sm:px-2 sm:py-1.5 border border-gray-200 rounded-lg bg-white focus-within:ring-1 focus-within:ring-amber-400 focus-within:border-amber-400 min-h-[44px] sm:min-h-[34px]">
              {focusChips.map((chip, i) => (
                <span 
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-1 sm:py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs"
                >
                  {chip}
                  <button 
                    onClick={() => setFocusChips(prev => prev.filter((_, idx) => idx !== i))}
                    className="hover:text-amber-600 transition-colors p-0.5"
                  >
                    <X size={12} className="sm:w-[10px] sm:h-[10px]" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={regeneratePrompt}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.includes(',')) {
                    const parts = value.split(',');
                    const newChip = parts[0].trim();
                    if (newChip) {
                      setFocusChips(prev => [...prev, newChip]);
                    }
                    setRegeneratePrompt(parts.slice(1).join(',').trimStart());
                  } else {
                    setRegeneratePrompt(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !regeneratePrompt && focusChips.length > 0) {
                    setFocusChips(prev => prev.slice(0, -1));
                  }
                  if (e.key === 'Enter' && regeneratePrompt.trim()) {
                    e.preventDefault();
                    setFocusChips(prev => [...prev, regeneratePrompt.trim()]);
                    setRegeneratePrompt('');
                  }
                }}
                placeholder={focusChips.length === 0 ? "Focus on... (separate by commas)" : ""}
                className="flex-1 min-w-[80px] text-sm sm:text-xs focus:outline-none bg-transparent"
              />
            </div>
          </div>
          
          {/* Generate button */}
          <button 
            onClick={() => {
              setIsGeneratingResponse(true);
              
              // Build response based on selected chips and focus text
              const selectedTopics = selectedIdeaIndexes.map(i => getTopicChips()[i]);
              const focusText = regeneratePrompt.trim();
              
              // Generate a contextual response
              let generatedResponse = '';
              const allTopics = [...selectedTopics, ...focusChips];
              if (focusText) {
                allTopics.push(focusText);
              }
              
              if (allTopics.length > 0) {
                // Simulated AI response based on topics and consideration
                const topicResponses = {
                  'power/wiring': 'Our assessment of the power and wiring infrastructure indicates that',
                  'network': 'Network connectivity requirements include',
                  'legacy systems': 'Integration with legacy systems will require',
                  'door hardware': 'The existing door hardware assessment shows',
                  'labor costs': 'Labor cost estimates for this project include',
                  'ROI': 'The projected ROI analysis indicates',
                  'bulk pricing': 'Bulk pricing options we\'re exploring include',
                  'maintenance savings': 'Expected maintenance savings include',
                  'fire safety': 'Fire safety compliance requirements include',
                  'ADA': 'ADA accessibility requirements mandate',
                  'cybersecurity': 'Cybersecurity considerations include',
                  'audit trails': 'Audit trail requirements specify',
                  'mobile keys': 'Mobile key integration requirements include',
                  'API': 'API compatibility requirements include',
                  'real-time sync': 'Real-time synchronization needs include',
                  'fallback plans': 'Fallback procedures we\'re implementing include'
                };
                
                generatedResponse = allTopics
                  .map(topic => topicResponses[topic.toLowerCase()] || `Regarding ${topic},`)
                  .join(' ');
                  
                if (!generatedResponse.endsWith('.')) {
                  generatedResponse += ' we are currently evaluating options.';
                }
              }
              
              // Delay for 2 seconds then show result
              setTimeout(() => {
                setUserInput(generatedResponse);
                setShowAIReference(false);
                setSelectedIdeaIndexes([]);
                setRegeneratePrompt('');
                setFocusChips([]);
                setIsGeneratingResponse(false);
              }, 2000);
            }}
            disabled={(selectedIdeaIndexes.length === 0 && !regeneratePrompt.trim() && focusChips.length === 0) || isGeneratingResponse}
            className={`w-full px-3 py-3 sm:py-2 rounded-lg text-sm sm:text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
              isGeneratingResponse
                ? 'bg-amber-300 text-gray-700 cursor-wait'
                : selectedIdeaIndexes.length > 0 || regeneratePrompt.trim() || focusChips.length > 0
                  ? 'bg-amber-400 text-gray-900 hover:bg-amber-500 active:bg-amber-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isGeneratingResponse ? (
              <>
                <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={12} />
                Generate
              </>
            )}
          </button>
        </div>
      )}

      {!awaitingClarification && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="relative">
            <textarea 
              ref={chatInputRef}
              value={userInput} 
              onChange={(e) => setUserInput(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessageWithFollowUp();
                }
              }}
              placeholder="Share your thoughts..." 
              className="w-full p-2.5 pr-16 border border-gray-200 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm min-h-[80px]" 
              rows={userInput.length > 100 ? 4 : 2} 
              autoComplete="off"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              {!showAIReference && (
                <button onClick={handleGetAIHelp} className="p-2 sm:p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 active:bg-amber-100 rounded-lg transition-colors" title="Get AI help">
                  <Sparkles size={18} className="sm:w-4 sm:h-4" />
                </button>
              )}
              <button onClick={handleSendMessageWithFollowUp} disabled={!userInput.trim()} className={`p-2 sm:p-1.5 rounded-lg transition-colors ${userInput.trim() ? 'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800' : 'bg-gray-100 text-gray-400'}`}>
                <Send size={18} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
          {!showAIReference && <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1"><Sparkles size={10} /> Tap sparkle for suggestions</p>}
        </div>
      )}
    </div>
  );

  const isDragging = draggingSnippet !== null;

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Top Nav */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 relative z-50">
        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">R</span>
        </div>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600 text-sm">General Workspace</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 text-sm font-medium">Unified Security Upgrade</span>
      </div>

      {/* Collapsed bar during drag - positioned below nav */}
      {isDragging && showEnginePanel && (
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-2 flex items-center gap-3 shadow-lg z-50">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
              <Sparkles size={10} className="text-white" />
            </div>
            <span className="font-medium text-white text-sm">Answer Engine</span>
          </div>
          
          <div className="h-4 w-px bg-white/20" />
          
          {/* Consideration chips */}
          <div className="flex items-center gap-2 flex-1">
            {considerations.map((consideration) => {
              const isCompleted = snippets.some(s => s.consideration === consideration.title);
              const isSource = activeConsideration?.id === consideration.id;
              return (
                <div
                  key={consideration.id}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                    isSource
                      ? 'bg-amber-400 text-gray-900'
                      : isCompleted
                        ? 'bg-green-400/30 text-green-100'
                        : 'bg-white/10 text-white/60'
                  }`}
                >
                  {isCompleted && !isSource && <Check size={10} className="text-green-300" />}
                  <span>{consideration.title.split(' ')[0]}</span>
                  {isSource && <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />}
                </div>
              );
            })}
          </div>
          
          <span className="text-white/60 text-xs">↓ Drop snippet below</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6 relative">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-4 cursor-pointer hover:text-gray-700">
            <ArrowLeft size={16} />
            <span>Back to Exploration</span>
          </div>
          
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            What is the feasibility of retrofitting existing doors with the Assa Abloy system?
          </h1>

          {/* Answer Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Answer</h2>
              <div className="flex items-center gap-3">
                {/* Subtle context window link */}
                {snippets.length > 0 && !isDragging && (
                  <button
                    onClick={() => setShowContextWindow(!showContextWindow)}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
                  >
                    {showContextWindow ? 'Hide' : 'Show'} context ({snippets.length})
                    <ChevronDown size={12} className={`transition-transform ${showContextWindow ? 'rotate-180' : ''}`} />
                  </button>
                )}

                {/* Version Dropdown - only show when there's content */}
                {directInput.trim() && (
                  <div className="relative" ref={versionDropdownRef}>
                    <button
                      onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                      className={`flex items-center gap-1.5 text-gray-500 text-sm font-medium hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors ${showVersionDropdown ? 'bg-gray-100' : ''}`}
                    >
                      <Clock size={16} />
                      <span>{versions[previewingVersion || currentVersion].label}</span>
                      <ChevronDown size={12} className={`transition-transform ${showVersionDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showVersionDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg border border-gray-200 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="p-2 border-b border-gray-100">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2">Version History</span>
                      </div>

                      <div className="max-h-64 overflow-y-auto py-1">
                        {[4, 3, 2, 1].map((num) => {
                          const version = versions[num];
                          const isSelected = previewingVersion ? previewingVersion === num : currentVersion === num;
                          const dotColors = {
                            green: 'bg-green-500',
                            amber: 'bg-amber-500',
                            teal: 'bg-teal-500',
                            gray: 'bg-gray-300'
                          };
                          const timeLabels = ['10m ago', '5m ago', '2m ago', 'Just now'];

                          return (
                            <div
                              key={num}
                              onClick={() => selectVersion(num)}
                              className={`px-2 py-1.5 mx-1 rounded cursor-pointer transition-colors ${
                                isSelected ? 'bg-teal-50' : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${dotColors[version.color]}`} />
                                  <span className={`text-sm font-medium ${num === 1 ? 'text-gray-500' : 'text-gray-900'}`}>
                                    {version.label}
                                  </span>
                                  {num === currentVersion && !previewingVersion && (
                                    <span className="text-xs text-teal-600 font-medium">Current</span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-400">{timeLabels[num - 1]}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-2 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                        <p className="text-xs text-gray-500 px-2">Click to preview · Auto-saved on changes</p>
                      </div>
                    </div>
                    )}
                  </div>
                )}

                <span className="text-sm text-gray-500">Assigned to: You</span>
              </div>
            </div>

            {/* Context Window - Hidden by default */}
            {snippets.length > 0 && !isDragging && showContextWindow && (
              <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Context Window</span>
                  <span className="text-xs text-gray-500">{snippets.length} snippets</span>
                </div>
                <div className="space-y-2">
                  {snippets.map((snippet, i) => (
                    <div key={i} className="text-sm p-2 bg-white rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-600">{snippet.consideration}</span>
                        {snippet.version > 1 && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            v{snippet.version}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-500">"{snippet.content}"</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Write directly textarea with integrated actions */}
            {!isDragging && (
              <div className="mb-4">
                {/* STATE: Refining */}
                {isRefining && (
                  <div className="border border-teal-200 rounded-xl bg-teal-50/30">
                    <div className="px-3 pt-2.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                        ✎ Edited
                      </span>
                    </div>
                    <div className="p-3 pt-2 text-sm text-gray-400 min-h-[7rem]">
                      {originalContent}
                    </div>
                    <div className="flex items-center justify-between px-3 py-2.5 border-t border-teal-100 bg-teal-50 rounded-b-xl">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-teal-700 text-sm font-medium">Refining your answer...</span>
                      </div>
                      <button
                        onClick={() => setIsRefining(false)}
                        className="px-3 py-1.5 text-gray-500 text-sm font-medium hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* STATE: Review Changes */}
                {isReviewingChanges && !isRefining && (
                  <div className="border-2 border-teal-400 rounded-xl ring-2 ring-teal-100">
                    <div className="px-3 pt-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">
                          ✨ Refined
                        </span>
                        <span className="text-xs text-gray-500">Review changes below</span>
                      </div>
                      <button
                        onClick={() => setShowDiff(!showDiff)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          showDiff
                            ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {showDiff ? 'Hide diff' : 'Show diff'}
                      </button>
                    </div>

                    {/* Clean view (default) */}
                    {!showDiff && (
                      <div className="p-3 pt-2 text-sm text-gray-700 min-h-[7rem]">
                        {refinedContent}
                      </div>
                    )}

                    {/* Diff view */}
                    {showDiff && (
                      <div className="p-3 pt-2 text-sm min-h-[7rem]">
                        <div className="mb-2 text-xs text-gray-500 font-medium">Changes highlighted:</div>
                        <div className="space-y-2">
                          <div className="p-2 bg-red-50 rounded border-l-2 border-red-300">
                            <span className="text-xs text-red-600 font-medium">Removed:</span>
                            <p className="text-red-800 line-through text-sm mt-1">{originalContent}</p>
                          </div>
                          <div className="p-2 bg-green-50 rounded border-l-2 border-green-300">
                            <span className="text-xs text-green-600 font-medium">Added:</span>
                            <p className="text-green-800 text-sm mt-1">{refinedContent}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between px-3 py-2.5 border-t border-teal-100 bg-teal-50/50 rounded-b-xl">
                      <button
                        onClick={handleDiscardChanges}
                        className="flex items-center gap-1.5 text-gray-500 text-sm font-medium hover:text-gray-700"
                      >
                        ← Discard changes
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAcceptAndEdit}
                          className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                          Accept & Edit
                        </button>
                        <button
                          onClick={handleAcceptAndSubmit}
                          className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 flex items-center gap-1"
                        >
                          Accept & Submit
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STATE: Normal (editable) */}
                {!isRefining && !isReviewingChanges && (
                  <div className={`relative border rounded-xl transition-all ${
                    previewingVersion
                      ? 'border-amber-300'
                      : directInput.trim()
                        ? 'border-teal-300 shadow-sm'
                        : 'border-gray-200'
                  }`}>
                    {isBuildingAnswer && (
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-amber-50 rounded-xl flex flex-col items-center justify-center z-10">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="relative">
                            <Sparkles size={24} className="text-teal-500 animate-pulse" />
                            <div className="absolute inset-0 animate-ping">
                              <Sparkles size={24} className="text-teal-300" />
                            </div>
                          </div>
                          <span className="text-sm font-medium text-teal-700">Building your answer...</span>
                        </div>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}

                    {/* Version Badge - only show when there's content */}
                    {!isBuildingAnswer && directInput.trim() && (
                      <div className="px-3 pt-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const displayVersion = versions[previewingVersion || currentVersion];
                            return (
                              <>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${displayVersion.badge.bgColor} ${displayVersion.badge.textColor} text-xs font-medium rounded-full`}>
                                  {displayVersion.badge.text}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {previewingVersion ? 'Previewing' : 'Current version'}
                                </span>
                              </>
                            );
                          })()}
                        </div>

                        {/* Auto-save indicator */}
                        <div className={`flex items-center gap-1 text-xs transition-opacity duration-300 ${
                          saveStatus === 'idle' ? 'opacity-0' : 'opacity-100'
                        }`}>
                          {saveStatus === 'editing' && (
                            <>
                              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                              <span className="text-gray-400">Editing...</span>
                            </>
                          )}
                          {saveStatus === 'saved' && (
                            <>
                              <Check size={12} className="text-green-500" />
                              <span className="text-green-600">Saved</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    <textarea
                      value={directInput}
                      onChange={(e) => setDirectInput(e.target.value)}
                      placeholder="Write your answer directly..."
                      className={`w-full h-28 p-3 ${isBuildingAnswer ? 'rounded-t-xl' : ''} resize-none focus:outline-none text-sm border-0 ${isBuildingAnswer ? 'opacity-0' : ''}`}
                    />

                    {/* Restore bar - shown when previewing old version */}
                    {previewingVersion && !isBuildingAnswer && (
                      <div className="flex items-center justify-between px-3 py-2 bg-amber-50 border-t border-amber-200">
                        <span className="text-sm text-amber-800">
                          Viewing <strong>{versions[previewingVersion].label}</strong>
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={cancelPreview}
                            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={restoreVersion}
                            className="px-3 py-1 bg-amber-500 text-white rounded text-sm font-medium hover:bg-amber-600 transition-colors"
                          >
                            Restore
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Normal action bar - hidden when previewing */}
                    {!previewingVersion && !isBuildingAnswer && (
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-b-xl border-t border-gray-100">
                        <button
                          onClick={handleRefineWithAI}
                          className={`flex items-center gap-1.5 text-xs transition-colors ${
                            directInput.trim()
                              ? 'text-teal-600 hover:text-teal-700'
                              : 'text-gray-300 cursor-default'
                          }`}
                          disabled={!directInput.trim()}
                        >
                          <Sparkles size={14} />
                          <span>Refine with AI</span>
                        </button>
                        <button
                          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                            directInput.trim()
                              ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                          disabled={!directInput.trim()}
                        >
                          Submit Answer
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Drop Zone - Visible during drag */}
            {isDragging ? (
              <div
                ref={dropZoneRef}
                className={`mb-4 p-8 rounded-xl border-2 border-dashed transition-all duration-200 ${
                  isOverDropZone 
                    ? 'border-teal-500 bg-teal-100 scale-[1.02]' 
                    : 'border-teal-300 bg-teal-50'
                }`}
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all ${
                    isOverDropZone ? 'bg-teal-500 scale-110' : 'bg-teal-200'
                  }`}>
                    <Plus size={24} className={isOverDropZone ? 'text-white' : 'text-teal-600'} />
                  </div>
                  <p className={`font-medium ${isOverDropZone ? 'text-teal-700' : 'text-teal-600'}`}>
                    {isOverDropZone ? 'Release to paste!' : 'Drop snippet here'}
                  </p>
                  <p className="text-sm text-teal-500 mt-1">
                    {snippets.length > 0 ? `Paste with ${snippets.length} other snippet${snippets.length > 1 ? 's' : ''}` : 'Start building your answer'}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Reviewers Section */}
          <div className="mt-4 sm:mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="font-medium text-gray-900 mb-2">Reviewers</h3>
            <p className="text-gray-500 text-sm">None</p>
          </div>
          
          {/* Demo trigger for loading animation */}
          <div className="mt-4 sm:mt-6 bg-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-2">Demo Controls</p>
            <button 
              onClick={() => {
                setShowEnginePanel(false);
                setIsLoadingConsiderations(true);
                setLoadingStep(0);
                
                const stepInterval = setInterval(() => {
                  setLoadingStep(prev => {
                    if (prev >= 4) {
                      clearInterval(stepInterval);
                      setTimeout(() => {
                        setIsLoadingConsiderations(false);
                        setShowEnginePanel(true);
                        setPanelCollapsed(false);
                        // Select the first consideration by default
                        const firstConsideration = considerations[0];
                        setActiveConsideration(firstConsideration);
                        setChatMessages([{ role: 'assistant', content: firstConsideration.clarifyingQuestion }]);
                      }, 600);
                      return prev;
                    }
                    return prev + 1;
                  });
                }, 800);
              }}
              className="px-3 py-1.5 bg-teal-600 text-white text-xs rounded-lg hover:bg-teal-700 transition-colors"
            >
              Trigger Loading Animation
            </button>
          </div>
          
          {/* Spacer for floating button */}
          <div className="h-28 sm:h-24" />
        </div>
      </div>

      {/* Floating Answer Engine Panel - Hidden during drag */}
      {showEnginePanel && !isDragging && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent" onClick={handleClosePanel} />
          <div className="fixed inset-0 sm:inset-4 z-50 flex items-center justify-center pointer-events-none">
            {panelCollapsed ? (
              /* Collapsed thin bar - Bottom on mobile, side on desktop */
              <div className={`pointer-events-auto absolute ${
                panelPosition === 'bottom' 
                  ? 'bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl' 
                  : panelPosition === 'left'
                    ? 'bottom-0 left-0 right-0 sm:bottom-auto sm:right-auto sm:top-0'
                    : 'bottom-0 left-0 right-0 sm:bottom-auto sm:left-auto sm:top-0'
              } ${panelPosition !== 'bottom' ? 'sm:h-full' : ''}`}>
                <div 
                  onClick={() => setPanelCollapsed(false)}
                  className={`bg-white shadow-2xl cursor-pointer hover:shadow-xl transition-all ${
                    panelPosition === 'bottom'
                      ? 'h-14 rounded-t-2xl flex items-center justify-between px-4 sm:px-6 border-t border-x border-gray-200'
                      : 'h-14 sm:h-full sm:w-12 rounded-t-2xl sm:rounded-2xl sm:rounded-t-2xl flex items-center sm:items-center sm:flex-col justify-between sm:justify-start px-4 sm:px-0 border-t sm:border border-x sm:border-x border-gray-200'
                  }`}
                >
                  {panelPosition === 'bottom' ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                          <Sparkles size={16} className="text-teal-600" />
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">Answer Engine</span>
                      </div>
                      {/* Consideration status chips - hidden on mobile */}
                      <div className="hidden sm:flex items-center gap-2">
                        {considerations.map((consideration) => {
                          const isCompleted = snippets.some(s => s.consideration === consideration.title);
                          const isActive = activeConsideration?.id === consideration.id;
                          return (
                            <div 
                              key={consideration.id}
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                isCompleted
                                  ? 'bg-green-100 text-green-700'
                                  : isActive
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {isCompleted && <Check size={10} />}
                              <span>{consideration.title.split(' ')[0]}</span>
                            </div>
                          );
                        })}
                      </div>
                      <ChevronUp size={18} className="text-gray-400" />
                    </>
                  ) : (
                    <>
                      {/* Mobile: horizontal bar */}
                      <div className="flex sm:hidden items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                          <Sparkles size={16} className="text-teal-600" />
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">Answer Engine</span>
                        <div className="flex items-center gap-1 ml-auto">
                          {considerations.map((consideration) => {
                            const isCompleted = snippets.some(s => s.consideration === consideration.title);
                            const isActive = activeConsideration?.id === consideration.id;
                            return (
                              <div 
                                key={consideration.id}
                                className={`w-2 h-2 rounded-full ${
                                  isCompleted
                                    ? 'bg-green-500'
                                    : isActive
                                      ? 'bg-teal-500'
                                      : 'bg-gray-300'
                                }`}
                              />
                            );
                          })}
                        </div>
                        <ChevronUp size={18} className="text-gray-400 ml-2" />
                      </div>
                      
                      {/* Desktop: vertical bar */}
                      <div className="hidden sm:flex sm:flex-col sm:items-center sm:h-full">
                        {/* Header icon */}
                        <div className="p-2 bg-gradient-to-b from-teal-600 to-teal-700 rounded-t-2xl w-full flex justify-center">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <Sparkles size={14} className="text-white" />
                          </div>
                        </div>
                        
                        {/* Progress dots */}
                        <div className="flex-1 py-4 flex flex-col items-center gap-2">
                          {considerations.map((consideration) => {
                            const isCompleted = snippets.some(s => s.consideration === consideration.title);
                            const isActive = activeConsideration?.id === consideration.id;
                            return (
                              <div 
                                key={consideration.id}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  isCompleted
                                    ? 'bg-green-500'
                                    : isActive
                                      ? 'bg-teal-500 scale-125'
                                      : 'bg-gray-300'
                                }`}
                                title={consideration.title}
                              />
                            );
                          })}
                        </div>
                        
                        {/* Expand icon */}
                        <div className="p-3 border-t border-gray-100">
                          <Maximize2 size={14} className="text-gray-400" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* Expanded panel */
              (() => {
                const panelStyles = getPanelStyles();
                return (
                  <div
                    ref={panelRef}
                    className={`${panelStyles.className} pointer-events-auto`}
                    style={panelStyles.style}
                  >
                    {/* Resize handles - only visible on desktop when panel is draggable */}
                    <div className="hidden sm:block">
                      {/* Corner handles */}
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'nw')}
                        className="absolute -top-1 -left-1 w-3 h-3 cursor-nwse-resize z-10"
                      />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'ne')}
                        className="absolute -top-1 -right-1 w-3 h-3 cursor-nesw-resize z-10"
                      />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'sw')}
                        className="absolute -bottom-1 -left-1 w-3 h-3 cursor-nesw-resize z-10"
                      />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'se')}
                        className="absolute -bottom-1 -right-1 w-3 h-3 cursor-nwse-resize z-10"
                      />
                      {/* Edge handles */}
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'n')}
                        className="absolute -top-1 left-3 right-3 h-2 cursor-ns-resize z-10"
                      />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 's')}
                        className="absolute -bottom-1 left-3 right-3 h-2 cursor-ns-resize z-10"
                      />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'w')}
                        className="absolute top-3 bottom-3 -left-1 w-2 cursor-ew-resize z-10"
                      />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'e')}
                        className="absolute top-3 bottom-3 -right-1 w-2 cursor-ew-resize z-10"
                      />
                    </div>

                    {/* Header - entire bar is draggable */}
                    <div
                      onMouseDown={handlePanelDragStart}
                      className={`flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-teal-600 to-teal-700 rounded-t-2xl sm:rounded-t-2xl flex-shrink-0 ${isPanelDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <Sparkles size={14} className="text-white sm:hidden" />
                            <Sparkles size={16} className="text-white hidden sm:block" />
                          </div>
                          <span className="font-semibold text-white text-sm sm:text-base">Answer Engine</span>
                        </div>
                        {snippets.length > 0 && (
                          <span className="text-[10px] sm:text-xs text-white/70 truncate">
                            ({snippets.length} snippet{snippets.length !== 1 ? 's' : ''})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setPanelCollapsed(true)}
                          className="p-1.5 text-white border border-white/30 rounded-md hover:bg-white/10 transition-colors"
                          title="Minimize"
                        >
                          <Minimize2 size={16} />
                        </button>
                        <button
                          onClick={handleClosePanel}
                          className="p-1.5 text-white border border-white/30 rounded-md hover:bg-white/10 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
                      <div className={`${activeConsideration ? 'hidden sm:block sm:w-1/4 sm:min-w-[200px] border-b sm:border-b-0 sm:border-r border-gray-200' : 'flex-1'} p-4 overflow-auto transition-all duration-300`}>
                        {ConsiderationsPanel()}
                      </div>
                      {activeConsideration && (
                        <div className="flex-1 sm:w-3/4 p-4 overflow-hidden bg-gray-50/50">
                          {ChatPanel()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </>
      )}

      {/* Floating Answer Engine CTA - Hidden when panel is open or dragging */}
      {!showEnginePanel && !isDragging && (
        <div className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-30">
          {isLoadingConsiderations ? (
            <div className="w-full sm:w-[320px] px-4 sm:px-5 py-3 bg-gradient-to-r from-teal-600 via-teal-500 to-teal-600 rounded-full shadow-lg shadow-teal-500/40 flex items-center gap-3 animate-gradient-x animate-glow">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center relative overflow-hidden flex-shrink-0">
                <Sparkles className="text-white z-10" size={16} />
                <div className="absolute inset-0 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <div className="absolute inset-0 bg-white/20 animate-ping" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm">Preparing Answer Engine</h3>
                <p key={loadingStep} className="text-teal-100 text-xs animate-fadeIn truncate">{loadingSteps[loadingStep]}</p>
              </div>
            </div>
          ) : (
            <div 
              onClick={handleStartEngine} 
              className="w-full sm:w-auto px-4 sm:px-5 py-3 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full cursor-pointer hover:from-teal-700 hover:to-teal-800 transition-all group shadow-lg hover:shadow-xl flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="text-white" size={16} />
              </div>
              <div className="flex-1 min-w-0 pr-1">
                <h3 className="text-white font-semibold text-sm">Answer Engine</h3>
                <p className="text-teal-100 text-xs truncate">{snippets.length > 0 ? `${snippets.length} of ${considerations.length} explored` : 'Leverage the Answer Framework'}</p>
              </div>
              <ChevronRight className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" size={18} />
            </div>
          )}
        </div>
      )}

      {/* Dragging element - follows cursor */}
      {isDragging && (
        <div 
          className="fixed z-[100] pointer-events-none"
          style={{ left: dragPosition.x, top: dragPosition.y }}
        >
          <div className="bg-amber-100 border-2 border-amber-400 rounded-lg px-3 py-2 shadow-xl max-w-[200px]">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={12} className="text-amber-600" />
              <span className="text-xs font-medium text-amber-700">{draggingSnippet.consideration}</span>
            </div>
            <p className="text-xs text-gray-700 truncate">"{draggingSnippet.content}"</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.2s ease-out; }
        
        @keyframes bounce-once {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-bounce-once { animation: bounce-once 0.4s ease-out; }
        
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-progress { animation: progress 2s ease-in-out; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x { 
          background-size: 200% 200%;
          animation: gradient-x 2s ease infinite; 
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 10px 40px -10px rgba(20, 184, 166, 0.5); }
          50% { box-shadow: 0 10px 60px -10px rgba(20, 184, 166, 0.8); }
        }
        .animate-glow { animation: glow 1.5s ease-in-out infinite; }
        
        /* Mobile safe area support */
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .pb-safe {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </div>
  );
}