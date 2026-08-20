/**
 * How many products the comparison holds.
 *
 * Five, and the number is a layout fact rather than a preference. The table gives each
 * product a column beside a label column, so the width of the results pane divided by
 * the narrowest column that can still carry a price sets the ceiling — at six the
 * columns fall under 100px in the pane at `lg` and the prices start wrapping.
 *
 * Its own module because two sides need it and one of them is a Client Component: the
 * board reads it to cap selection, the comparison reads it to size its grid, and a
 * constant imported *from* a `"use client"` file would drag that file's whole boundary
 * along with it.
 */
export const MAX_COMPARE = 5;
