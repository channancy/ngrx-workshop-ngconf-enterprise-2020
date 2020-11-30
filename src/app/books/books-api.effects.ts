import { Injectable } from "@angular/core";
import { createEffect, Actions, ofType } from "@ngrx/effects";
import { concatMap, exhaustMap, map, mergeMap, tap } from "rxjs/operators";
import { BooksService } from "../shared/services";
import { BooksPageActions, BooksApiActions } from "./actions";

@Injectable()
export class BooksApiEffects {
  constructor(private actions$: Actions, private booksService: BooksService) {}

  loadAll$ = createEffect(() => {
    // use actions stream
    return this.actions$.pipe(
      // listen for when this action is dispatched
      ofType(BooksPageActions.enter),
      tap((action) => {
        console.log(action);
      }),
      // mergeMap to flatten out observable
      exhaustMap((action) => {
        return (
          this.booksService
            .all()
            // booksLoaded action
            .pipe(map((books) => BooksApiActions.booksLoaded({ books })))
        );
      })
    );
  });

  createBook$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(BooksPageActions.createBook),
      concatMap((action) => {
        return this.booksService
          .create(action.book)
          .pipe(map((book) => BooksApiActions.bookCreated({ book })));
      })
    );
  });

  updateBook$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(BooksPageActions.updateBook),
      // concatMap((action) => {
      //   return this.booksService
      //     .update(action.bookId, action.changes)
      //     .pipe(map((book) => BooksApiActions.bookUpdated({ book })));
      // })
      // Can also destructure the action
      concatMap(({ bookId, changes }) => {
        return this.booksService
          .update(bookId, changes)
          .pipe(map((book) => BooksApiActions.bookUpdated({ book })));
      })
    );
  });

  deleteBook$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(BooksPageActions.deleteBook),
      mergeMap((action) => {
        return this.booksService
          .delete(action.bookId)
          .pipe(
            map(() => BooksApiActions.bookDeleted({ bookId: action.bookId }))
          );
      })
    );
  });
}
