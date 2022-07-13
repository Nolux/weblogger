import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "$lib/store/firebase";

export const Log = class {
  constructor({ body, user, localeDate, project, timecode }) {
    this.body = body;
    this.createdAt = new Date();
    this.createdBy = { id: user.uid, name: user.displayName };
    this.localeDate = {
      day: localeDate.day,
      month: localeDate.month,
      year: localeDate.year,
    };
    this.project = { id: project.id, name: project.name };
    this.timecode = {
      hours: timecode.hours,
      minutes: timecode.minutes,
      seconds: timecode.seconds,
      frames: timecode.frames,
    };
  }
};

export const saveLog = async (log, cb) => {
  await addDoc(collection(db, "logs"), { ...log });
  cb();
};

export const deleteLog = async (id, cb) => {
  await deleteDoc(doc(db, "logs", id));
  cb();
};

export const updateLog = async (log, cb) => {
  const docRef = doc(db, "logs", log.id);

  await updateDoc(docRef, {
    body: log.body,
    timecode: log.timecode,
  });
};
