import { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';

export async function loader({ request, params }: LoaderFunctionArgs) {}

export const action = async ({ request, params }: ActionFunctionArgs) => {};

export default function Index() {}
