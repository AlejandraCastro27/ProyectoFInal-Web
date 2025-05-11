// src/services/projectService.js
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

const projectsRef = collection(db, "projects");

export const createProject = async (project) => {
  const docRef = await addDoc(projectsRef, project);
  return docRef.id;
};

export const getProjects = async () => {
  const snapshot = await getDocs(projectsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateProject = async (id, updatedData) => {
  const projectDoc = doc(db, "projects", id);
  await updateDoc(projectDoc, updatedData);
};

export const deleteProject = async (id) => {
  const projectDoc = doc(db, "projects", id);
  await deleteDoc(projectDoc);
};
