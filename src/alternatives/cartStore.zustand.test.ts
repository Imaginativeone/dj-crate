import { testSongs } from "@/lib/testSongs";
import { useCartStore } from "./cartStore.zustand";

it("runs the same reducer through a Zustand store, with no React involved", () => {
  const { dispatch } = useCartStore.getState();
  dispatch({ type: "added", song: testSongs[0] });
  dispatch({ type: "added", song: testSongs[1] });
  dispatch({ type: "moved", id: testSongs[1].id, direction: "up" });
  expect(useCartStore.getState().items.map((s) => s.id)).toEqual([1, 0]);
});
