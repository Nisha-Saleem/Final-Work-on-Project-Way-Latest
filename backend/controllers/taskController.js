import Task from '../models/Task.js';
import { User } from '../models/User.js';

// Create a new task
export const createTask = async (req, res) => {
  console.log('✅ [Tasks] Create task request received');
  console.log('✅ [Tasks] Request body:', req.body);
  
  try {
    const { name, assignedTo, deadline, projectName, leaderName, groupId } = req.body;

    console.log('✅ [Tasks] Creating new task...');
    const newTask = new Task({
      id: Date.now().toString(),
      name,
      assignedTo,
      deadline: deadline || 'TBD',
      status: 'Pending',
      initials: assignedTo.charAt(0).toUpperCase(),
      colorClass: 'bg-slate-200 text-slate-700',
      projectName,
      leaderName,
      groupId
    });

    const savedTask = await newTask.save();
    console.log('✅ [Tasks] Task created successfully:', savedTask.name);

    res.status(201).json({ 
      success: true, 
      message: 'Task created successfully!',
      task: savedTask 
    });
  } catch (error) {
    console.error('❌ [Tasks] Error creating task:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating task', 
      error: error.message 
    });
  }
};

// Get all tasks for a project
export const getTasksByProject = async (req, res) => {
  console.log('✅ [Tasks] Get tasks by project request received');
  console.log('✅ [Tasks] Project name:', req.params.projectName);
  
  try {
    const { projectName } = req.params;
    
    // Get leader's groupId from the project
    const user = await User.findOne({ name: projectName });
    const groupId = user?.groupId;
    
    let query = {};
    if (groupId) {
      // If user has a groupId, filter by groupId
      query = { groupId };
    } else {
      // Fallback to projectName if no groupId
      query = { projectName };
    }
    
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    console.log('✅ [Tasks] Retrieved', tasks.length, 'tasks for project:', projectName);
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error('❌ [Tasks] Error fetching tasks:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching tasks', 
      error: error.message 
    });
  }
};

// Get tasks by assignee
export const getTasksByAssignee = async (req, res) => {
  console.log('✅ [Tasks] Get tasks by assignee request received');
  console.log('✅ [Tasks] Assignee:', req.params.assignee);
  
  try {
    const { assignee } = req.params;
    const tasks = await Task.find({ assignedTo: assignee }).sort({ createdAt: -1 });
    console.log('✅ [Tasks] Retrieved', tasks.length, 'tasks for assignee:', assignee);
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error('❌ [Tasks] Error fetching tasks by assignee:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching tasks', 
      error: error.message 
    });
  }
};

// Get tasks by groupId
export const getTasksByGroupId = async (req, res) => {
  console.log('✅ [Tasks] Get tasks by groupId request received');
  console.log('✅ [Tasks] Group ID:', req.params.groupId);
  
  try {
    const { groupId } = req.params;
    
    if (!groupId) {
      console.log('⚠️ [Tasks] Missing groupId in request');
      return res.status(400).json({ 
        success: false, 
        message: 'groupId is required' 
      });
    }
    
    const tasks = await Task.find({ groupId }).sort({ createdAt: -1 });
    console.log('✅ [Tasks] Retrieved', tasks.length, 'tasks for groupId:', groupId);
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error('❌ [Tasks] Error fetching tasks by groupId:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching tasks', 
      error: error.message 
    });
  }
};

// Toggle task status
export const toggleTaskStatus = async (req, res) => {
  console.log('✅ [Tasks] Toggle task status request received');
  console.log('✅ [Tasks] Task ID:', req.params.id);
  
  try {
    const { id } = req.params;
    const task = await Task.findOne({ id });

    if (!task) {
      console.log('⚠️ [Tasks] Task not found:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    const oldStatus = task.status;
    task.status = task.status === 'Pending' ? 'Completed' : 'Pending';
    const updatedTask = await task.save();
    console.log('✅ [Tasks] Task status updated:', oldStatus, '->', updatedTask.status);

    res.status(200).json({ 
      success: true, 
      message: 'Task status updated successfully',
      task: updatedTask 
    });
  } catch (error) {
    console.error('❌ [Tasks] Error toggling task status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error toggling task status', 
      error: error.message 
    });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  console.log('✅ [Tasks] Delete task request received');
  console.log('✅ [Tasks] Task ID:', req.params.id);
  
  try {
    const { id } = req.params;
    const deletedTask = await Task.findOneAndDelete({ id });

    if (!deletedTask) {
      console.log('⚠️ [Tasks] Task not found:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    console.log('✅ [Tasks] Task deleted successfully:', deletedTask.name);
    res.status(200).json({ 
      success: true, 
      message: 'Task deleted successfully' 
    });
  } catch (error) {
    console.error('❌ [Tasks] Error deleting task:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting task', 
      error: error.message 
    });
  }
};

// Get task statistics for a project
export const getTaskStats = async (req, res) => {
  console.log('✅ [Tasks] Get task statistics request received');
  console.log('✅ [Tasks] Project name:', req.params.projectName);
  
  try {
    const { projectName } = req.params;
    const tasks = await Task.find({ projectName });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Get member statistics
    const assignees = [...new Set(tasks.map(t => t.assignedTo))];
    const memberStats = assignees.map(person => {
      const personTasks = tasks.filter(t => t.assignedTo === person);
      const personTotal = personTasks.length;
      const personCompleted = personTasks.filter(t => t.status === 'Completed').length;
      const personProgress = personTotal === 0 ? 0 : Math.round((personCompleted / personTotal) * 100);
      
      return {
        name: person,
        total: personTotal,
        completed: personCompleted,
        progress: personProgress
      };
    });

    console.log('📊 [Tasks] Statistics - Total:', totalTasks, 'Completed:', completedTasks, 'Progress:', progressPercentage + '%');
    res.status(200).json({ 
      success: true, 
      stats: {
        total: totalTasks,
        completed: completedTasks,
        progress: progressPercentage,
        memberStats
      } 
    });
  } catch (error) {
    console.error('❌ [Tasks] Error fetching task stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching task stats', 
      error: error.message 
    });
  }
};
