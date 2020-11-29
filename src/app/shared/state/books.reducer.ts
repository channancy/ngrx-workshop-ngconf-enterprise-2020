import { createReducer, on, Action, createSelector } from "@ngrx/store";
import { BookModel, calculateBooksGrossEarnings } from "src/app/shared/models";
import { BooksPageActions, BooksApiActions } from "src/app/books/actions";

export interface State {
  collection: BookModel[];
  activeBookId: string | null;
}

const createBook = (books: BookModel[], book: BookModel) => [...books, book];
const updateBook = (books: BookModel[], changes: BookModel) =>
  books.map((book) => {
    return book.id === changes.id ? Object.assign({}, book, changes) : book;
  });
const deleteBook = (books: BookModel[], bookId: string) =>
  books.filter((book) => bookId !== book.id);

export const initialState: State = {
  collection: [],
  activeBookId: null,
};

export const booksReducer = createReducer(
  initialState,
  on(
    BooksPageActions.enter,
    BooksPageActions.clearSelectedBook,
    (state, action) => {
      return {
        ...state,
        activeBookId: null,
      };
    }
  ),
  on(BooksPageActions.selectBook, (state, action) => {
    return {
      ...state,
      activeBookId: action.bookId,
    };
  }),
  on(BooksApiActions.booksLoaded, (state, action) => {
    return {
      ...state,
      collection: action.books,
    };
  }),
  on(BooksApiActions.bookDeleted, (state, action) => {
    return {
      ...state,
      collection: deleteBook(state.collection, action.bookId),
    };
  }),
  on(BooksApiActions.bookCreated, (state, action) => {
    return {
      ...state,
      collection: createBook(state.collection, action.book),
    };
  }),
  on(BooksApiActions.bookUpdated, (state, action) => {
    return {
      ...state,
      collection: updateBook(state.collection, action.book),
    };
  })
);

export function reducer(state: undefined | State, action: Action) {
  return booksReducer(state, action);
}

// Getter selectors
export const selectAll = (state: State) => state.collection;
export const selectActiveBookId = (state: State) => state.activeBookId;

// Complex selectors

// Unoptimized
export const selectActiveBook_unoptimized = (state: State) => {
  // Inputs
  const books = selectAll(state);
  const activeBookId = selectActiveBookId(state);

  // Computation
  return books.find((book) => book.id === activeBookId) || null;
};

// Optimized
export const selectActiveBook = createSelector(
  // Selectors
  selectAll,
  selectActiveBookId,
  // Projector function
  (books, activeBookId) => {
    return books.find((book) => book.id === activeBookId) || null;
  }
);

// Unoptimized
export const selectEarningsTotals_unoptimized = (state: State) => {
  const books = selectAll(state);

  return calculateBooksGrossEarnings(books);
};

// Optimized
export const selectEarningsTotals = createSelector(
  // Selector
  selectAll,
  // Projector function
  calculateBooksGrossEarnings
);
