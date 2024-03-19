export interface ITodoDto {
  id: string;
  msg: string;
}

export interface ICreateTodoDto {
  ownerId: string;
  msg: string;
}
