'use client';
import { useState, useEffect } from 'react';
import { socket } from '@/app/socket';
import styles from './AdminPanel.module.css';

export default function AdminPanel() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [secret, setSecret] = useState('');
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [stats, setStats] = useState({
        totalRooms: 0,
        activeUsers: 0,
        messageCount: 0
    });

    useEffect(() => {
        if (isAuthenticated) {
            socket.on('admin-stats', (data) => {
                setStats(data);
            });

            socket.on('admin-rooms', (roomData) => {
                setRooms(roomData);
            });

            // Request initial data
            socket.emit('get-admin-stats');
            socket.emit('get-admin-rooms');
        }

        return () => {
            socket.off('admin-stats');
            socket.off('admin-rooms');
        };
    }, [isAuthenticated]);

    const handleLogin = (e) => {
        e.preventDefault();
        socket.emit('admin-login', secret);
        socket.once('admin-auth-response', (success) => {
            setIsAuthenticated(success);
            if (!success) {
                alert('Invalid admin credentials');
            }
        });
    };

    const handleAction = (action, userId) => {
        if (!selectedRoom) return;
        socket.emit('admin-action', {
            action,
            roomId: selectedRoom,
            userId
        });
    };

    if (!isAuthenticated) {
        return (
            <div className={styles.loginContainer}>
                <form onSubmit={handleLogin} className={styles.loginForm}>
                    <h2>Admin Login</h2>
                    <input
                        type="password"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                        placeholder="Enter admin secret"
                        className={styles.input}
                    />
                    <button type="submit" className={styles.button}>Login</button>
                </form>
            </div>
        );
    }

    return (
        <div className={styles.adminPanel}>
            <div className={styles.statsSection}>
                <h2>System Statistics</h2>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span>Total Rooms:</span>
                        <span>{stats.totalRooms}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span>Active Users:</span>
                        <span>{stats.activeUsers}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span>Total Messages:</span>
                        <span>{stats.messageCount}</span>
                    </div>
                </div>
            </div>

            <div className={styles.roomSection}>
                <h2>Active Rooms</h2>
                <div className={styles.roomList}>
                    {rooms.map(room => (
                        <div
                            key={room.id}
                            className={`${styles.roomItem} ${selectedRoom === room.id ? styles.selected : ''}`}
                            onClick={() => setSelectedRoom(room.id)}
                        >
                            <span>Room: {room.id}</span>
                            <span>Users: {room.userCount}</span>
                        </div>
                    ))}
                </div>
            </div>

            {selectedRoom && (
                <div className={styles.actionSection}>
                    <h2>Room Actions</h2>
                    <div className={styles.userList}>
                        {rooms.find(r => r.id === selectedRoom)?.users.map(user => (
                            <div key={user.id} className={styles.userItem}>
                                <span>{user.id}</span>
                                <div className={styles.actions}>
                                    <button onClick={() => handleAction('mute', user.id)}>
                                        {user.muted ? 'Unmute' : 'Mute'}
                                    </button>
                                    <button onClick={() => handleAction('ban', user.id)}>
                                        Ban
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
