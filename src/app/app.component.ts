import { Component } from '@angular/core';
import { Task } from './task/task';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import {
  TaskDialogComponent,
  TaskDialogResult,
} from './task-dialog/task-dialog.component';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  getDocs,
  query,
  CollectionReference,
  runTransaction,
  deleteDoc,
  addDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

const getObservable = (collection: CollectionReference<Task>) => {
  const subject = new BehaviorSubject<Task[]>([]);
  collectionData(collection, { idField: 'id' }).subscribe((val: Task[]) => {
    subject.next(val);
  });
  return subject;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  todo = collectionData(
    collection(this.store, 'todo') as CollectionReference<Task>,
    {
      idField: 'id',
    }
  ) as Observable<Task[]>;
  inProgress = collectionData(
    collection(this.store, 'inProgress') as CollectionReference<Task>,
    { idField: 'id' }
  ) as Observable<Task[]>;
  done = collectionData(
    collection(this.store, 'done') as CollectionReference<Task>,
    { idField: 'id' }
  ) as Observable<Task[]>;
  constructor(private dialog: MatDialog, private store: Firestore) {}

  editTask(list: 'done' | 'todo' | 'inProgress', task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task,
        enableDelete: true,
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult | undefined) => {
        if (!result) {
          return;
        }
        if (result.delete) {
          deleteDoc(doc(this.store, `${list}/${task.id}`));
        } else {
          updateDoc(doc(this.store, `${list}/${task.id}`), {
            title: task.title,
            description: task.description,
          });
        }
      });
  }

  drop(event: CdkDragDrop<any>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    const item = event.previousContainer.data[event.previousIndex];
    runTransaction(this.store, () => {
      const promise = Promise.all([
        deleteDoc(doc(this.store, `${event.previousContainer.id}/${item.id}`)),
        addDoc(collection(this.store, event.container.id), item),
      ]);
      return promise;
    });
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  newTask(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task: {},
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult | undefined) => {
        if (!result?.task?.description || !result?.task?.title) {
          return;
        }
        addDoc(collection(this.store, 'todo'), result.task);
      });
  }
}
