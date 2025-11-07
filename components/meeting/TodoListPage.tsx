import React, { useState } from 'react';
import TodoCard from './TodoCard';
import { RelatedTasksSidebar } from './RelatedTasksSidebar';

// Type Todo phải khớp với TodoCard.tsx (có referenceTaskIds)
type Todo = {
    id: string;
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    assignee?: {
        fullName?: string;
        [key: string]: any;
    };
    referencedTasks?: string[];
    // ...thêm field khác nếu cần
};

type Props = {
    todos: Todo[];
};

const TodoListPage: React.FC<Props> = ({ todos }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentReferenceIds, setCurrentReferenceIds] = useState<string[]>([]);

    const handleShowRelatedTasks = (taskIds: string[]) => {
        console.log('handleShowRelatedTasks', taskIds);
        setCurrentReferenceIds(taskIds);
        setSidebarOpen(true);
    };

    const handleCloseSidebar = () => setSidebarOpen(false);

    return (
        <div style={{ position: 'relative' }}>
            <div className="todo-list">
                {todos.map((todo) => (
                    <TodoCard
                        key={todo.id}
                        todo={todo}
                        onShowRelatedTasks={handleShowRelatedTasks}
                    />
                ))}
            </div>
            <RelatedTasksSidebar
                open={sidebarOpen}
                onClose={handleCloseSidebar}
                referenceTaskIds={currentReferenceIds}
            />
        </div>
    );
};

export default TodoListPage;
