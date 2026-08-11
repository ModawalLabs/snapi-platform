import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders its label and fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Add to cart</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("blocks interaction and announces busy state while loading", async () => {
    const onClick = vi.fn();
    render(
      <Button isLoading onClick={onClick}>
        Add to cart
      </Button>,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("lets a caller override conflicting utility classes", () => {
    render(<Button className="h-16">Tall</Button>);
    expect(screen.getByRole("button").className).toContain("h-16");
    expect(screen.getByRole("button").className).not.toContain("h-10");
  });
});
