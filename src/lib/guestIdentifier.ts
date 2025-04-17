// lib/guestIdentifier.ts
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { API_URL } from '../utils/axiosConfig';

const GUEST_ID_KEY = 'theoforge_guest_id';

export async function getGuestId(): Promise<string | null> {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  
  if (!guestId) {
    try {
      // Create guest in backend and get id
      const res = await axios.post(`${API_URL}/guests`, {session_id: uuidv4()});
      guestId = res.data.id;
      if(guestId) localStorage.setItem(GUEST_ID_KEY, guestId);
      else {
        console.error('Error creating guest');
        return null; // Null if database failed to respond
      }
    } catch (error) {
      console.error('Error creating guest:', error);
      return null;
    }
  }
  
  return guestId;
}