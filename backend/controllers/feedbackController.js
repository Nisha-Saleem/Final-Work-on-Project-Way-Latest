import Feedback from '../models/Feedback.js';
import { User } from '../models/User.js';

// Create feedback (for teacher)
export const createFeedback = async (req, res) => {
  console.log('💬 [Feedback] Create feedback request received');
  console.log('💬 [Feedback] Request body:', req.body);
  
  try {
    let { ideaId, ideaTitle, leaderName, projectName, feedback, status, teacherName, groupId } = req.body;
    const normalizedProjectName = (projectName || '').trim();
    
    console.log('💬 [Feedback] Initial groupId:', groupId, 'Leader:', leaderName);

    if (!normalizedProjectName) {
      console.warn('⚠️ [Feedback] Missing projectName from user input');
    }

    // Step 1: If groupId is not provided, try to fetch it from the leader
    if (!groupId) {
      console.log('💬 [Feedback] No groupId provided, attempting to fetch from leader:', leaderName);
      if (leaderName) {
        const leader = await User.findOne({ name: leaderName });
        if (leader) {
          groupId = leader.groupId;
          console.log('💬 [Feedback] Retrieved groupId from leader:', groupId);
        } else {
          console.warn('⚠️ [Feedback] Leader user not found in database:', leaderName);
        }
      } else {
        console.warn('⚠️ [Feedback] No leaderName provided');
      }
    }

    // Step 2: Verify groupId is valid
    if (!groupId || groupId === '' || groupId === 'null') {
      console.error('❌ [Feedback] Cannot create feedback without valid groupId. Leader:', leaderName, 'GroupId:', groupId);
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot create feedback: Leader must be assigned to a group. Please ensure the group leader has a valid groupId in the system.',
        groupId: null
      });
    }

    console.log('💬 [Feedback] Creating feedback record with:');
    console.log('   - ideaId:', ideaId);
    console.log('   - leaderName:', leaderName);
    console.log('   - groupId:', groupId);
    console.log('   - teacherName:', teacherName);

    const newFeedback = new Feedback({
      ideaId,
      ideaTitle,
      leaderName,
      projectName: normalizedProjectName,
      groupId,
      feedback,
      status: status || 'Feedback Sent',
      teacherName
    });

    const savedFeedback = await newFeedback.save();
    
    console.log('✅ [Feedback] Feedback saved successfully');
    console.log('   - ID:', savedFeedback._id);
    console.log('   - groupId:', savedFeedback.groupId);
    console.log('   - Idea:', savedFeedback.ideaTitle);

    res.status(201).json({ 
      success: true, 
      message: 'Feedback sent successfully!',
      feedback: savedFeedback 
    });
  } catch (error) {
    console.error('❌ [Feedback] Error creating feedback:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating feedback', 
      error: error.message 
    });
  }
};

// Get all feedback for a student
export const getFeedbackByLeader = async (req, res) => {
  console.log('💬 [Feedback] Get feedback by leader request received');
  console.log('💬 [Feedback] Leader name:', req.params.leaderName);
  console.log('💬 [Feedback] Query params:', req.query);
  
  try {
    const { leaderName } = req.params;
    const { projectName, userName } = req.query;
    
    // Get user's groupId
    const user = await User.findOne({ name: leaderName });
    const groupId = user?.groupId;
    
    let query = {};
    if (!groupId) {
  // Agar groupId nahi hai to empty feedback bhejo
  return res.status(200).json({ success: true, feedbacks: [] });
}

query = { groupId };

    
    console.log('💬 [Feedback] MongoDB query:', JSON.stringify(query));
    const feedbacks = await Feedback.find(query).sort({ timestamp: -1 });
    
    // Add per-user read status to each feedback
    const feedbacksWithReadStatus = feedbacks.map(feedback => ({
      ...feedback.toObject(),
      isRead: userName ? feedback.readBy.includes(userName) : false
    }));
    
    console.log('✅ [Feedback] Retrieved', feedbacks.length, 'feedbacks for leader:', leaderName);
    res.status(200).json({ success: true, feedbacks: feedbacksWithReadStatus });
  } catch (error) {
    console.error('❌ [Feedback] Error fetching feedbacks:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching feedbacks', 
      error: error.message 
    });
  }
};

// Get all feedback (for teacher)
export const getAllFeedback = async (req, res) => {
  console.log('💬 [Feedback] Get all feedback request received');
  console.log('💬 [Feedback] Query params:', req.query);

  try {
    const { groupId, userName } = req.query;
    
    // Only return feedback if groupId is provided
    if (!groupId) {
      return res.status(200).json({ success: true, feedbacks: [] });
    }
    
    const query = { groupId };
    console.log('💬 [Feedback] MongoDB query:', JSON.stringify(query));
    const feedbacks = await Feedback.find(query).sort({ timestamp: -1 });
    
    // Add per-user read status to each feedback
    const feedbacksWithReadStatus = feedbacks.map(feedback => ({
      ...feedback.toObject(),
      isRead: userName ? feedback.readBy.includes(userName) : false
    }));
    
    console.log('✅ [Feedback] Retrieved', feedbacks.length, 'feedbacks total');
    res.status(200).json({ success: true, feedbacks: feedbacksWithReadStatus });
  } catch (error) {
    console.error('❌ [Feedback] Error fetching feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedbacks',
      error: error.message
    });
  }
};

// Get feedback by group ID (for group-specific feedback)
export const getFeedbackByGroup = async (req, res) => {
  console.log('💬 [Feedback] Get feedback by group request received');
  console.log('💬 [Feedback] Group ID:', req.params.groupId);
  
  try {
    const { groupId } = req.params;
    
    if (!groupId) {
      console.warn('⚠️ [Feedback] groupId is required but was not provided');
      return res.status(400).json({ 
        success: false, 
        message: 'groupId is required',
        feedbacks: []
      });
    }

    console.log('💬 [Feedback] Fetching feedback for groupId:', groupId);
    // Only fetch feedback where groupId is NOT null and matches the requested groupId
    const feedbacks = await Feedback.find({ 
      groupId: { $eq: groupId, $ne: null } 
    }).sort({ timestamp: -1 });
    
    console.log('✅ [Feedback] Retrieved', feedbacks.length, 'feedbacks for group:', groupId);
    res.status(200).json({ success: true, feedbacks });
  } catch (error) {
    console.error('❌ [Feedback] Error fetching feedback by group:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching feedback by group', 
      error: error.message,
      feedbacks: []
    });
  }
};

// Get feedback by idea ID
export const getFeedbackByIdea = async (req, res) => {
  console.log('💬 [Feedback] Get feedback by idea request received');
  console.log('💬 [Feedback] Idea ID:', req.params.ideaId);
  
  try {
    const { ideaId } = req.params;
    const feedbacks = await Feedback.find({ ideaId }).sort({ timestamp: -1 });
    console.log('✅ [Feedback] Retrieved', feedbacks.length, 'feedbacks for idea:', ideaId);
    res.status(200).json({ success: true, feedbacks });
  } catch (error) {
    console.error('❌ [Feedback] Error fetching feedbacks:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching feedbacks', 
      error: error.message 
    });
  }
};

// Delete feedback
export const deleteFeedback = async (req, res) => {
  console.log('💬 [Feedback] Delete feedback request received');
  console.log('💬 [Feedback] Feedback ID:', req.params.id);
  
  try {
    const { id } = req.params;
    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    if (!deletedFeedback) {
      console.log('⚠️ [Feedback] Feedback not found:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Feedback not found' 
      });
    }

    console.log('✅ [Feedback] Feedback deleted successfully:', id);
    res.status(200).json({ 
      success: true, 
      message: 'Feedback deleted successfully' 
    });
  } catch (error) {
    console.error('❌ [Feedback] Error deleting feedback:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting feedback', 
      error: error.message 
    });
  }
};

// Mark feedback as read
export const markFeedbackAsRead = async (req, res) => {
  console.log('💬 [Feedback] Mark feedback as read request received');
  console.log('💬 [Feedback] Feedback ID:', req.params.id);
  console.log('💬 [Feedback] User:', req.body.userName);
  
  try {
    const { id } = req.params;
    const { userName } = req.body;
    
    if (!userName) {
      return res.status(400).json({ 
        success: false, 
        message: 'userName is required' 
      });
    }
    
    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { 
        $addToSet: { readBy: userName },
        read: true 
      },
      { new: true }
    );

    if (!feedback) {
      console.log('⚠️ [Feedback] Feedback not found:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Feedback not found' 
      });
    }

    console.log('✅ [Feedback] Feedback marked as read for user:', userName);
    res.status(200).json({ 
      success: true, 
      message: 'Feedback marked as read',
      feedback 
    });
  } catch (error) {
    console.error('❌ [Feedback] Error marking feedback as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error marking feedback as read', 
      error: error.message 
    });
  }
};

// Migration: Add groupId to existing feedback records
export const migrateFeedbackGroupId = async () => {
  console.log('🔄 [Feedback Migration] Starting migration to add groupId to feedback records...');
  
  try {
    // Find all feedback records without groupId
    const feedbacksWithoutGroupId = await Feedback.find({ 
      $or: [
        { groupId: null },
        { groupId: undefined },
        { groupId: '' }
      ]
    });

    console.log(`📊 [Feedback Migration] Found ${feedbacksWithoutGroupId.length} feedback records without groupId`);

    if (feedbacksWithoutGroupId.length === 0) {
      console.log('✅ [Feedback Migration] No feedback records need migration');
      return { success: true, message: 'No migration needed', updated: 0 };
    }

    let updatedCount = 0;
    let failedCount = 0;

    // Process each feedback record
    for (const feedbackRecord of feedbacksWithoutGroupId) {
      try {
        // Find the leader's groupId
        const leader = await User.findOne({ name: feedbackRecord.leaderName });
        
        if (leader && leader.groupId) {
          // Update the feedback record with groupId
          await Feedback.findByIdAndUpdate(
            feedbackRecord._id,
            { groupId: leader.groupId },
            { new: true }
          );
          updatedCount++;
          console.log(`✅ [Feedback Migration] Updated feedback for leader: ${feedbackRecord.leaderName}, groupId: ${leader.groupId}`);
        } else {
          failedCount++;
          console.warn(`⚠️ [Feedback Migration] Leader not found or has no groupId: ${feedbackRecord.leaderName}`);
        }
      } catch (error) {
        failedCount++;
        console.error(`❌ [Feedback Migration] Error migrating feedback record:`, error.message);
      }
    }

    console.log(`🎉 [Feedback Migration] Migration complete. Updated: ${updatedCount}, Failed: ${failedCount}`);
    return { 
      success: true, 
      message: 'Migration completed',
      updated: updatedCount,
      failed: failedCount
    };
  } catch (error) {
    console.error('❌ [Feedback Migration] Migration failed:', error);
    return { 
      success: false, 
      message: 'Migration failed',
      error: error.message
    };
  }
};

