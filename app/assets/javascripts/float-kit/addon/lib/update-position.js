import {
  arrow,
  computePosition,
  flip,
  inline,
  offset,
  shift,
} from "@floating-ui/dom";
import { FLOAT_UI_PLACEMENTS } from "float-kit/lib/constants";
import { isTesting } from "discourse-common/config/environment";
import { headerOffset } from "discourse/lib/offset-calculator";
import { iconHTML } from "discourse-common/lib/icon-library";
import domFromString from "discourse-common/lib/dom-from-string";

export async function updatePosition(trigger, content, options) {
  let padding = 0;
  if (!isTesting()) {
    padding = options.padding || {
      top: headerOffset(),
      left: 10,
      right: 10,
      bottom: 10,
    };
  }

  const flipOptions = {
    fallbackPlacements: options.fallbackPlacements ?? FLOAT_UI_PLACEMENTS,
    padding,
  };

  const middleware = [
    offset(options.offset ? parseInt(options.offset, 10) : 10),
  ];

  if (options.inline) {
    middleware.push(inline());
  }

  middleware.push(flip(flipOptions));
  middleware.push(shift({ padding }));

  let arrowElement;
  if (options.arrow) {
    arrowElement = content.querySelector(".arrow");

    if (!arrowElement) {
      arrowElement = domFromString(
        iconHTML("tippy-rounded-arrow", { class: "arrow" })
      )[0];
      content.appendChild(arrowElement);
    }

    middleware.push(arrow({ element: arrowElement }));
  }

  content.dataset.strategy = options.strategy || "absolute";

  const { x, y, placement, middlewareData } = await computePosition(
    trigger,
    content,
    {
      placement: options.placement,
      strategy: options.strategy || "absolute",
      middleware,
    }
  );

  if (options.computePosition) {
    options.computePosition(content, {
      x,
      y,
      placement,
      middlewareData,
      arrowElement,
    });
  } else {
    content.dataset.placement = placement;
    Object.assign(content.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    if (middlewareData.arrow && arrowElement) {
      const arrowX = middlewareData.arrow.x;
      const arrowY = middlewareData.arrow.y;

      Object.assign(arrowElement.style, {
        left: arrowX != null ? `${arrowX}px` : "",
        top: arrowY != null ? `${arrowY}px` : "",
      });
    }
  }
}
