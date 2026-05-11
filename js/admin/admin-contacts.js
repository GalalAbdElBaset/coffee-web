/**
 * Admin Contacts Module - View contact messages
 * @version 1.0.0
 */

const AdminContacts = (function() {
    'use strict';

    let messages = [];

    /**
     * Initialize contacts management
     */
    async function init() {
        await loadMessages();
    }

    /**
     * Load contact messages from Supabase
     */
    async function loadMessages() {
        const container = document.getElementById('messages-list');
        if (!container) return;

        container.innerHTML = '<div class="loading">Loading messages...</div>';

        const result = await window.supabaseService.getAll('contact_messages', {
            orderBy: { column: 'created_at', ascending: false }
        });

        if (result.success) {
            messages = result.data;
            renderMessages();
        } else {
            container.innerHTML = '<div class="error">Failed to load messages.</div>';
        }
    }

    /**
     * Render messages
     */
    function renderMessages() {
        const container = document.getElementById('messages-list');
        if (!container) return;

        if (messages.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-envelope-open-text fa-3x"></i>
                    <p>No messages yet. When customers contact you, messages will appear here.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = messages.map(msg => `
            <div class="message-item" data-id="${msg.id}">
                <div class="message-header">
                    <div>
                        <strong>${escapeHtml(msg.name)}</strong> 
                        <span style="font-size: 0.8rem; opacity: 0.7;">&lt;${escapeHtml(msg.email)}&gt;</span>
                    </div>
                    <div>
                        <span class="message-status status-${msg.status || 'pending'}">${msg.status || 'pending'}</span>
                        <span style="font-size: 0.8rem; margin-left: 0.5rem;">${new Date(msg.created_at).toLocaleString()}</span>
                    </div>
                </div>
                ${msg.phone ? `<div><strong>Phone:</strong> ${escapeHtml(msg.phone)}</div>` : ''}
                <div style="margin-top: 0.5rem; padding: 0.5rem; background: rgba(0,0,0,0.2); border-radius: 8px;">
                    ${escapeHtml(msg.message)}
                </div>
                <div class="card-actions" style="margin-top: 0.8rem;">
                    <button class="btn-reply" data-id="${msg.id}" data-email="${msg.email}" style="background: #007bff; padding:0.3rem 1rem; border:none; border-radius:6px; color:white; cursor:pointer;">
                        <i class="fa-regular fa-reply"></i> Reply
                    </button>
                    <button class="btn-mark-replied" data-id="${msg.id}" style="background: #28a745; padding:0.3rem 1rem; border:none; border-radius:6px; color:white; cursor:pointer;">
                        Mark as Replied
                    </button>
                    <button class="btn-delete" data-id="${msg.id}" style="background: #dc3545; padding:0.3rem 1rem; border:none; border-radius:6px; color:white; cursor:pointer;">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        document.querySelectorAll('.btn-reply').forEach(btn => {
            btn.addEventListener('click', () => replyToMessage(btn.dataset.id, btn.dataset.email));
        });

        document.querySelectorAll('.btn-mark-replied').forEach(btn => {
            btn.addEventListener('click', () => markAsReplied(btn.dataset.id));
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteMessage(btn.dataset.id));
        });
    }

    /**
     * Reply to message (opens email client)
     */
    function replyToMessage(id, email) {
        window.location.href = `mailto:${email}?subject=Reply from Coffee Brand&body=Dear customer,%0D%0A%0D%0AThank you for contacting us...`;
    }

    /**
     * Mark message as replied
     */
    async function markAsReplied(id) {
        const result = await window.supabaseService.update('contact_messages', id, {
            status: 'replied',
            updated_at: new Date().toISOString()
        });
        
        if (result.success) {
            UIModule.showPopup('Message marked as replied!', 'success');
            await loadMessages();
        } else {
            UIModule.showPopup('Failed to update status.', 'error');
        }
    }

    /**
     * Delete message
     */
    async function deleteMessage(id) {
        if (!confirm('Are you sure you want to delete this message?')) return;
        
        const result = await window.supabaseService.delete('contact_messages', id);
        
        if (result.success) {
            UIModule.showPopup('Message deleted successfully!', 'success');
            await loadMessages();
        } else {
            UIModule.showPopup('Failed to delete message.', 'error');
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    return {
        init,
        loadMessages
    };
})();

window.AdminContacts = AdminContacts;