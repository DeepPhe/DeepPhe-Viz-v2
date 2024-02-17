import { useDrag, useDrop } from "react-dnd";

function withDrag(Component) {
  return function WrappedComponent(props) {
    const [{ isDragging }, dragRef] = useDrag({
      type: "item",
      item: props.index,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });
    return <Component ref={dragRef} isDragging={isDragging} {...props} />;
  };
}

function withDrop(Component) {
  return function WrappedComponent(props) {
    const [spec, dropRef] = useDrop({
      accept: "item",
      hover: (item, monitor) => {
        const dragIndex = item.index;
        const hoverIndex = props.index;
        const hoverBoundingRect = ref.current?.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const hoverActualY = monitor.getClientOffset().y - hoverBoundingRect.top;

        // if dragging down, continue only when hover is smaller than middle Y
        if (dragIndex < hoverIndex && hoverActualY < hoverMiddleY) return;
        // if dragging up, continue only when hover is bigger than middle Y
        if (dragIndex > hoverIndex && hoverActualY > hoverMiddleY) return;

        moveListItem(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    });
    return <Component ref={dropRef} {...props} />;
  };
}

export function getDragDropRef(Component) {
  return withDrop(withDrag(Component));
}
