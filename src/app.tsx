import { getData } from "./api";
import { ISection } from "./ISuperDynamicForm";
import { Loading } from "./Loading";
import { SuperDynamicForm } from "./SuperDynamicForm";
import { useAsync } from "./useAsync";

export const App = () => {
  const [formData, isLoading, noFormData] = useAsync<ISection[], typeof getData>(getData, "query", "endpoint");
  return <div>{isLoading ? <Loading /> : noFormData ? noFormData.message : <SuperDynamicForm formData={formData || []} />}</div>;
};
